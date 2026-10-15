/**
 * rideCleanup.job.js
 *
 * Scheduled cron job that automatically manages expired rides:
 *
 *  STEP 1 — Mark as completed  (runs at 00:00 IST every day)
 *           Any ride whose date < today AND status is still 'scheduled'/'ongoing'
 *           gets flipped to 'completed'.
 *
 *  STEP 2 — Hard delete        (runs at 00:05 IST every day)
 *           Any ride with status 'completed' or 'cancelled' AND whose date is
 *           older than RIDE_RETENTION_DAYS (default 7, configurable via .env)
 *           is permanently deleted along with its associated Booking and Message
 *           documents.
 *
 * Why two steps?
 *   Drivers/passengers deserve a brief window to review completed trip history
 *   before it's purged. The retention period is configurable so you can increase
 *   it (e.g. 30 days) without changing code.
 */

const cron = require('node-cron');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Message = require('../models/Message');

// How many days after a ride's date before it is hard-deleted.
const RETENTION_DAYS = parseInt(process.env.RIDE_RETENTION_DAYS || '7', 10);

// ─── Step 1: Mark past rides as completed ─────────────────────────────────────
async function markExpiredRides() {
  const now = new Date();
  // Start of today (midnight UTC) — rides are stored as full Date objects
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  try {
    const result = await Ride.updateMany(
      {
        date: { $lt: today },
        status: { $in: ['scheduled', 'ongoing'] },
      },
      { $set: { status: 'completed' } }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Cleanup] ✅  Marked ${result.modifiedCount} expired ride(s) as 'completed'.`
      );
    }
  } catch (err) {
    console.error('[Cleanup] ❌  Failed to mark expired rides:', err.message);
  }
}

// ─── Step 2: Hard-delete old completed/cancelled rides ────────────────────────
async function deleteOldRides() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  // Midnight of the cutoff day
  cutoff.setHours(0, 0, 0, 0);

  try {
    // Find rides to delete first so we can cascade
    const oldRides = await Ride.find(
      {
        date: { $lt: cutoff },
        status: { $in: ['completed', 'cancelled'] },
      },
      '_id'
    ).lean();

    if (oldRides.length === 0) {
      console.log(`[Cleanup] ℹ️   No rides older than ${RETENTION_DAYS} day(s) to delete.`);
      return;
    }

    const rideIds = oldRides.map((r) => r._id);

    // Cascade: remove bookings and messages linked to these rides
    const [bookingResult, messageResult] = await Promise.all([
      Booking.deleteMany({ rideId: { $in: rideIds } }),
      Message.deleteMany({ rideId: { $in: rideIds } }),
    ]);

    // Now delete the rides themselves
    const rideResult = await Ride.deleteMany({ _id: { $in: rideIds } });

    console.log(
      `[Cleanup] 🗑️   Deleted ${rideResult.deletedCount} ride(s), ` +
      `${bookingResult.deletedCount} booking(s), ` +
      `${messageResult.deletedCount} message(s) ` +
      `(rides older than ${RETENTION_DAYS} day(s)).`
    );
  } catch (err) {
    console.error('[Cleanup] ❌  Failed to delete old rides:', err.message);
  }
}

// ─── Schedule ─────────────────────────────────────────────────────────────────
function startCleanupJobs() {
  // Step 1 — Every day at 3:00 PM IST
  // Cron expression: minute hour day month weekday
  cron.schedule('0 15 * * *', markExpiredRides, {
    timezone: 'Asia/Kolkata',
  });

  // Step 2 — Every day at 3:05 PM IST (just after step 1 completes)
  cron.schedule('5 15 * * *', deleteOldRides, {
    timezone: 'Asia/Kolkata',
  });

  console.log(
    `[Cleanup] ⏰  Scheduled jobs started.` +
    ` Rides will be marked completed at 3:00 PM IST and` +
    ` deleted after ${RETENTION_DAYS} day(s) at 3:05 PM IST.`
  );
}

// ─── Manual trigger (useful for testing / admin endpoints) ───────────────────
async function runCleanupNow() {
  console.log('[Cleanup] 🔧  Running manual cleanup...');
  await markExpiredRides();
  await deleteOldRides();
  console.log('[Cleanup] 🔧  Manual cleanup complete.');
}

module.exports = { startCleanupJobs, runCleanupNow };
