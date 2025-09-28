import React, { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Booking, Group, User, UserRole } from '@/types';
import { ALL_COURTS, BOOKING_START_HOUR, BOOKING_END_HOUR } from '@/constants';
import Icon from '@/components/ui/Icon';
import { printAnalytics } from '@/src/utils/print';
import { exportToCSV } from '@/src/utils/csv';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  allBookings: Booking[];
  users: User[];
  groups: Group[];
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, allBookings, users, groups }) => {
  const [days, setDays] = useState(7);

  const filteredBookings = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return allBookings.filter(b => {
      const bookingDate = new Date(b.startTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }, [allBookings, days]);

  const analytics = useMemo(() => {
    const coaches = users.filter(u => u.role === UserRole.Coach);
    
    // Coach stats
    const coachStats = coaches.map(coach => {
      let totalMinutes = 0;
      const coachGroups = new Set(groups.filter(g => g.members.includes(coach.id)).map(g => g.id));
      filteredBookings.forEach(booking => {
        if (booking.groupId && coachGroups.has(booking.groupId)) {
          totalMinutes += (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60);
        }
      });
      return { coachId: coach.id, coachName: coach.name, totalHours: totalMinutes / 60 };
    }).sort((a,b) => b.totalHours - a.totalHours);

    // Court stats
    const courtStats = ALL_COURTS.map(courtId => {
      let totalMinutes = 0;
      filteredBookings.forEach(booking => {
        if (booking.courtId === courtId) {
          totalMinutes += (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / (1000 * 60);
        }
      });
      return { courtId, totalHours: totalMinutes / 60 };
    });
    
    // Heatmap data
    const heatmapData: { hour: number; utilization: number[] }[] = [];
    let maxUtilization = 0;
    for (let hour = BOOKING_START_HOUR; hour < BOOKING_END_HOUR; hour++) {
      const utilization = ALL_COURTS.map(courtId => {
        let count = 0;
        filteredBookings.forEach(b => {
          if (b.courtId === courtId && new Date(b.startTime).getHours() <= hour && new Date(b.endTime).getHours() > hour) {
            count++;
          }
        });
        if (count > maxUtilization) maxUtilization = count;
        return count;
      });
      heatmapData.push({ hour, utilization });
    }
    // Normalize utilization
    heatmapData.forEach(row => {
        row.utilization = row.utilization.map(u => maxUtilization > 0 ? u / maxUtilization : 0)
    });

    return { coachStats, courtStats, heatmapData, days };
  }, [filteredBookings, users, groups]);

  const handlePrint = () => {
    printAnalytics({
        ...analytics,
        dateRange: `Last ${days} Days`,
        courts: ALL_COURTS
    });
  }

  const handleExportCoaches = () => {
    exportToCSV(
        ['coachName', 'totalHours'],
        analytics.coachStats,
        `coach_hours_last_${days}_days.csv`
    );
  }
  const handleExportCourts = () => {
     exportToCSV(
        ['courtId', 'totalHours'],
        analytics.courtStats,
        `court_usage_last_${days}_days.csv`
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Planner Analytics">
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <div>
                    <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700">Date Range</label>
                    <select id="dateRange" value={days} onChange={e => setDays(Number(e.target.value))} className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2">
                        <option value="7">Last 7 Days</option>
                        <option value="30">Last 30 Days</option>
                        <option value="90">Last 90 Days</option>
                    </select>
                </div>
                <div className="flex gap-2">
                     <Button variant="secondary" onClick={handlePrint}>
                        <Icon name="printer" className="w-5 h-5 mr-2" /> Print Report
                    </Button>
                </div>
            </div>

            {/* Heatmap */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Court Utilization Heatmap</h3>
                <div className="grid gap-1" style={{gridTemplateColumns: `auto repeat(${ALL_COURTS.length}, 1fr)`}}>
                    <div />
                    {ALL_COURTS.map(c => <div key={c} className="text-center text-xs font-bold text-gray-600">C{c}</div>)}
                    {analytics.heatmapData.map(({hour, utilization}) => (
                        <React.Fragment key={hour}>
                            <div className="text-right text-xs text-gray-500 pr-2">{hour}:00</div>
                            {utilization.map((u, i) => (
                                <div key={i} className="h-6 rounded-sm border border-black/5" style={{backgroundColor: `rgba(37, 99, 235, ${u})`}} title={`Utilization: ${(u*100).toFixed(0)}%`}/>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Stats Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-semibold text-gray-900">Coach Hours</h3>
                         <Button variant="secondary" className="!px-2 !py-1" onClick={handleExportCoaches}><Icon name="arrow-down-tray" className="w-4 h-4 mr-1"/>CSV</Button>
                    </div>
                    <div className="overflow-y-auto max-h-48 border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coach</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th></tr></thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.coachStats.map(stat => (<tr key={stat.coachId}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{stat.coachName}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.totalHours.toFixed(2)}</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-semibold text-gray-900">Court Usage</h3>
                         <Button variant="secondary" className="!px-2 !py-1" onClick={handleExportCourts}><Icon name="arrow-down-tray" className="w-4 h-4 mr-1"/>CSV</Button>
                    </div>
                    <div className="overflow-y-auto max-h-48 border rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th><th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hours</th></tr></thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                                {analytics.courtStats.map(stat => (<tr key={stat.courtId}><td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Court {stat.courtId}</td><td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{stat.totalHours.toFixed(2)}</td></tr>))}
                             </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  );
};

export default AnalyticsModal;
