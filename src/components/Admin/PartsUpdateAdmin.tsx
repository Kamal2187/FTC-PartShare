import React, { useState, useEffect } from 'react';
import { useParts } from '../../contexts/PartsContext';
import { updateScheduler } from '../../services/updateScheduler';
import { 
  RefreshCw, 
  Clock, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Settings,
  Play,
  Pause,
  Trash2
} from 'lucide-react';

export default function PartsUpdateAdmin() {
  const { updateStatus, forceUpdate, isLoading, error } = useParts();
  const [scheduleInfo, setScheduleInfo] = useState(updateScheduler.getScheduleInfo());
  const [notifications, setNotifications] = useState(updateScheduler.getRecentNotifications());
  const [customInterval, setCustomInterval] = useState(24); // hours
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    added: number;
    updated: number;
    errors: string[];
  } | null>(null);

  // Update schedule info periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduleInfo(updateScheduler.getScheduleInfo());
      setNotifications(updateScheduler.getRecentNotifications());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Listen for parts update events
  useEffect(() => {
    const handlePartsUpdate = (event: CustomEvent) => {
      setUpdateResult(event.detail);
      setNotifications(updateScheduler.getRecentNotifications());
    };

    window.addEventListener('partsUpdated', handlePartsUpdate as EventListener);
    return () => window.removeEventListener('partsUpdated', handlePartsUpdate as EventListener);
  }, []);

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    setUpdateResult(null);
    
    try {
      const result = await forceUpdate();
      setUpdateResult(result);
    } catch (err) {
      console.error('Force update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSchedulerToggle = () => {
    if (scheduleInfo.isRunning) {
      updateScheduler.stop();
    } else {
      updateScheduler.start();
    }
    setScheduleInfo(updateScheduler.getScheduleInfo());
  };

  const handleIntervalUpdate = () => {
    const intervalMs = customInterval * 60 * 60 * 1000; // Convert hours to ms
    updateScheduler.updateInterval(intervalMs);
    setScheduleInfo(updateScheduler.getScheduleInfo());
  };

  const handleClearNotifications = () => {
    updateScheduler.clearNotifications();
    setNotifications([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatInterval = (ms: number) => {
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Database className="w-6 h-6 mr-2 text-blue-600" />
          Parts Database Management
        </h1>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Parts</p>
                <p className="text-2xl font-bold text-blue-900">{updateStatus.totalParts}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Last Update</p>
                <p className="text-sm font-semibold text-green-900">
                  {updateStatus.lastUpdate ? formatDate(updateStatus.lastUpdate) : 'Never'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Next Update</p>
                <p className="text-sm font-semibold text-orange-900">
                  {scheduleInfo.nextUpdate ? formatDate(scheduleInfo.nextUpdate) : 'Not scheduled'}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Manual Update Controls */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Update</h2>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleForceUpdate}
              disabled={isUpdating || isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-5 h-5 ${isUpdating || isLoading ? 'animate-spin' : ''}`} />
              <span>{isUpdating || isLoading ? 'Updating...' : 'Force Update Now'}</span>
            </button>
            
            <div className="text-sm text-gray-600">
              Manually trigger an immediate update of the parts database
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {updateResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-green-700">
                Update completed: {updateResult.added} parts added, {updateResult.updated} parts updated
                {updateResult.errors.length > 0 && (
                  <div className="mt-2 text-red-600">
                    {updateResult.errors.length} errors occurred:
                    <ul className="list-disc list-inside mt-1">
                      {updateResult.errors.map((err, idx) => (
                        <li key={idx} className="text-sm">{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Scheduler Controls */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Automatic Updates
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Scheduler Status</p>
                <p className="text-sm text-gray-600">
                  {scheduleInfo.isRunning ? 'Running' : 'Stopped'} • 
                  Update every {formatInterval(scheduleInfo.interval)}
                </p>
              </div>
              
              <button
                onClick={handleSchedulerToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
                  scheduleInfo.isRunning 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {scheduleInfo.isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Stop Scheduler</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Scheduler</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Interval (hours)
                </label>
                <input
                  type="number"
                  value={customInterval}
                  onChange={(e) => setCustomInterval(Number(e.target.value))}
                  min="1"
                  max="168"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleIntervalUpdate}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 mt-6"
              >
                Update Interval
              </button>
            </div>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Updates</h2>
            
            {notifications.length > 0 && (
              <button
                onClick={handleClearNotifications}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    notification.hasErrors 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      {notification.hasErrors ? (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          notification.hasErrors ? 'text-red-900' : 'text-green-900'
                        }`}>
                          {notification.message}
                        </p>
                        {notification.hasErrors && notification.errors.length > 0 && (
                          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                            {notification.errors.slice(0, 3).map((error, errorIdx) => (
                              <li key={errorIdx}>{error}</li>
                            ))}
                            {notification.errors.length > 3 && (
                              <li>... and {notification.errors.length - 3} more errors</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No recent updates</p>
          )}
        </div>
      </div>
    </div>
  );
}
