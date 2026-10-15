export default function SeatLayout({ totalSeats = 4, bookedSeats = [], selectedSeat = null, onSeatSelect }) {
  
  const handleSelect = (index) => {
    if (bookedSeats.includes(index) || index === 0) return
    onSeatSelect(index)
  }

  const getSeatClass = (index) => {
    if (index === 0) return 'seat-driver'
    if (bookedSeats.includes(index)) return 'seat-booked'
    if (selectedSeat === index) return 'seat-selected'
    return 'seat-available'
  }

  const renderSeat = (index, label) => (
    <div 
      key={index}
      onClick={() => handleSelect(index)}
      className={getSeatClass(index)}
    >
      {index === 0 ? '🚘' : bookedSeats.includes(index) ? '✕' : label}
    </div>
  )

  return (
    <div className="flex flex-col items-center p-6 glass rounded-xl">
      <div className="w-full max-w-[240px] bg-slate-800/50 p-6 rounded-[2rem] border-2 border-slate-700 relative">
        <div className="absolute top-0 inset-x-0 h-4 bg-slate-700 rounded-t-full opacity-50" />
        
        {/* Row 1: Driver + Front */}
        <div className="flex justify-between mb-8 mt-4">
          {renderSeat(0, 'D')}
          {renderSeat(1, 'F1')}
        </div>

        {/* Row 2: Rear 1 */}
        <div className="flex justify-between mb-8">
          {renderSeat(2, 'R1')}
          {totalSeats > 4 && renderSeat(3, 'R2')}
          {renderSeat(totalSeats === 4 ? 3 : 4, 'R3')}
        </div>
        
        {/* Row 3: Rear 2 (for 6/7 seaters) */}
        {totalSeats > 4 && (
          <div className="flex justify-between">
            {renderSeat(5, 'R4')}
            {totalSeats === 7 && renderSeat(6, 'R5')}
            {renderSeat(totalSeats === 7 ? 7 : 6, 'R6')}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-slate-300">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-sm" /> Available</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-500 rounded-sm shadow-[0_0_8px_rgba(99,102,241,0.5)]" /> Selected</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm opacity-70" /> Booked</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm" /> Driver</div>
      </div>
    </div>
  )
}
