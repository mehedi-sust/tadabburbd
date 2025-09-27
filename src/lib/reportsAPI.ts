import api from './api';

export const reportsAPI = {
  // Report content
  reportContent: (data: {
    contentType: 'dua' | 'blog';
    contentId: string;
    reason: 'inaccurate' | 'inappropriate' | 'spam' | 'copyright' | 'other';
    description?: string;
  }) => api.post('/reports/report', data),

  // Get reports (admin only)
  getReports: (params?: {
    status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    page?: number;
    limit?: number;
  }) => api.get('/reports/admin', { params }),

  // Update report status (admin only)
  updateReportStatus: (reportId: string, data: {
    status: 'reviewed' | 'resolved' | 'dismissed';
    adminNotes?: string;
  }) => api.put(`/reports/admin/${reportId}`, data),

  // Get report statistics (admin only)
  getReportStats: () => api.get('/reports/admin/stats'),
};
