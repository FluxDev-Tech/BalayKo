import { Property, School, Conversation, Message, PropertyReport, AuditLog, User, ReservationRequest, PropertyReview } from '../types';
import { INITIAL_PROPERTIES } from '../data/initialProperties';
import { INITIAL_SCHOOLS } from '../data/schoolsData';
import { calculateDistanceKm, estimateTravelTime, isCoordinateWithinCapiz } from '../data/capizMunicipalities';

const STORAGE_KEYS = {
  PROPERTIES: 'balayko_properties_v4',
  SCHOOLS: 'balayko_schools_v4',
  FAVORITES: 'balayko_favorites_v1',
  COMPARISONS: 'balayko_comparisons_v1',
  CONVERSATIONS: 'balayko_conversations_v1',
  MESSAGES: 'balayko_messages_v1',
  REPORTS: 'balayko_reports_v1',
  AUDIT_LOGS: 'balayko_audit_logs_v1',
  USERS: 'balayko_users_v3',
  CURRENT_USER: 'balayko_current_user_v3',
  RESERVATIONS: 'balayko_reservations_v1',
  REVIEWS: 'balayko_reviews_v1',
};

// Fixed Admin Account per requirements (admin@board.com / admin123)
export const FIXED_ADMIN_ACCOUNT: User = {
  id: 'user-admin-fixed',
  name: 'Capiz BH Administrator',
  email: 'admin@board.com',
  password: 'admin123',
  role: 'admin',
  phone: '+63 936 888 1234',
  createdAt: '2026-08-01T00:00:00Z',
};

// Initial Seed Conversations (empty until students inquire to real registered owners)
const INITIAL_CONVERSATIONS: Conversation[] = [];
const INITIAL_MESSAGES: Message[] = [];

// Initial Seed Reviews for Capiz Boarding Houses
export const INITIAL_REVIEWS: PropertyReview[] = [
  {
    id: 'rev-seed-1',
    propertyId: 'prop-pilar-1',
    propertyName: 'Villa Pilar Student Residences & Dorm',
    studentId: 'student-seed-1',
    studentName: 'Hannah Marie Bernales',
    studentSchool: 'capsu-pilar',
    rating: 5,
    cleanlinessRating: 5,
    safetyRating: 5,
    landlordRating: 5,
    valueRating: 5,
    stayDuration: '1st Semester (2025-2026)',
    comment: 'Super lapit sa CAPSU Pilar! 2 minutes lang lakad nasa loob ka na ng campus. Napakabait ni Nanay Elena (landlord) at laging may maiinom na malinis na tubig.',
    createdAt: '2026-09-12T04:20:00Z',
  },
  {
    id: 'rev-seed-2',
    propertyId: 'prop-pilar-1',
    propertyName: 'Villa Pilar Student Residences & Dorm',
    studentId: 'student-seed-2',
    studentName: 'Joshua Miguel De Castro',
    studentSchool: 'capsu-pilar',
    rating: 5,
    cleanlinessRating: 5,
    safetyRating: 5,
    landlordRating: 4,
    valueRating: 5,
    stayDuration: '1 Year (2025-2026)',
    comment: 'Mabilis ang WiFi kahit sabay-sabay kaming nagka-klase online. Tahimik kapag gabi kaya sarap mag-aral bago mag-exam.',
    createdAt: '2026-09-28T11:15:00Z',
  },
  {
    id: 'rev-seed-3',
    propertyId: 'prop-pilar-2',
    propertyName: 'Balay Paglaum Student Inn',
    studentId: 'student-seed-3',
    studentName: 'Camille Joy Villasis',
    studentSchool: 'capsu-pilar',
    rating: 5,
    cleanlinessRating: 5,
    safetyRating: 5,
    landlordRating: 5,
    valueRating: 4,
    stayDuration: 'Current Boarder (2026)',
    comment: 'Ligtas para sa aming mga babaeng estudyante. May sariling banyo ang room kaya hindi nag-aagawan tuwing umaga bago pumasok sa klase.',
    createdAt: '2026-10-02T08:30:00Z',
  },
  {
    id: 'rev-seed-4',
    propertyId: 'prop-pilar-3',
    propertyName: 'Dormitoryo ni Lola Nena (Budget Bedspace)',
    studentId: 'student-seed-4',
    studentName: 'Arnel John Bermejo',
    studentSchool: 'capsu-pilar',
    rating: 4,
    cleanlinessRating: 4,
    safetyRating: 4,
    landlordRating: 5,
    valueRating: 5,
    stayDuration: 'Summer Class 2026',
    comment: 'Napakamura ng upa, sakto sa budget ng nagtitipid na estudyante. Bagamat unverified pa sa app, mabait naman si Lola Nena.',
    createdAt: '2026-10-05T09:00:00Z',
  },
  {
    id: 'rev-seed-5',
    propertyId: 'prop-roxas-1',
    propertyName: 'Fuentes Scholars Haven & Suites',
    studentId: 'student-seed-5',
    studentName: 'Princess Mae Tan',
    studentSchool: 'capsu-main',
    rating: 5,
    cleanlinessRating: 5,
    safetyRating: 5,
    landlordRating: 5,
    valueRating: 5,
    stayDuration: '1st Semester 2026',
    comment: 'High tech may keycard access at super bilis ng fiber WiFi! Katapat lang ng Fuentes Drive gate ng CAPSU Main.',
    createdAt: '2026-10-10T14:45:00Z',
  }
];

export const StorageService = {
  // Properties
  getProperties(): Property[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
      if (data) {
        const parsed = JSON.parse(data) as Property[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    return INITIAL_PROPERTIES;
  },

  resetDemoData(): Property[] {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(INITIAL_PROPERTIES));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_PROPERTIES;
  },

  saveProperties(properties: Property[]) {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  },

  getPropertyById(id: string): Property | undefined {
    return this.getProperties().find(p => p.id === id);
  },

  createProperty(propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'inquiriesCount'>): { success: boolean; property?: Property; error?: string } {
    // Validate Capiz coordinates
    if (!isCoordinateWithinCapiz(propertyData.lat, propertyData.lng)) {
      return {
        success: false,
        error: 'Property coordinates must be strictly within Capiz, Philippines boundaries (Lat 11.10 - 11.75, Lng 122.30 - 123.15).'
      };
    }

    const schools = this.getSchools();
    const nearestSchool = schools.find(s => s.id === propertyData.nearestSchoolId) || schools[0];
    const dist = calculateDistanceKm(propertyData.lat, propertyData.lng, nearestSchool.lat, nearestSchool.lng);
    const travel = estimateTravelTime(dist);

    const newProperty: Property = {
      ...propertyData,
      id: `prop-${Date.now()}`,
      distanceToSchoolKm: dist,
      walkingMinutes: travel.walkingMin,
      drivingMinutes: travel.drivingMin,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: 0,
      inquiriesCount: 0,
    };

    const properties = this.getProperties();
    properties.unshift(newProperty);
    this.saveProperties(properties);

    this.addAuditLog({
      adminId: 'system',
      adminName: 'System / Owner Action',
      action: 'Listing Submitted for Moderation',
      targetId: newProperty.id,
      targetType: 'property',
      notes: `Listing "${newProperty.name}" submitted in ${newProperty.municipality}`
    });

    return { success: true, property: newProperty };
  },

  updatePropertyStatus(propertyId: string, status: Property['status'], reason?: string, adminUser?: User) {
    const properties = this.getProperties();
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      prop.status = status;
      prop.rejectionReason = reason;
      prop.updatedAt = new Date().toISOString();
      this.saveProperties(properties);

      this.addAuditLog({
        adminId: adminUser?.id || 'admin',
        adminName: adminUser?.name || 'Administrator',
        action: `Status Updated to ${status.toUpperCase()}`,
        targetId: propertyId,
        targetType: 'property',
        notes: reason ? `Reason: ${reason}` : `Listing ${status}`
      });
    }
  },

  // Real-time automatic view counter (no fake numbers)
  incrementPropertyViews(propertyId: string): number {
    const properties = this.getProperties();
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      prop.viewsCount = (prop.viewsCount || 0) + 1;
      this.saveProperties(properties);
      return prop.viewsCount;
    }
    return 0;
  },

  // Schools
  getSchools(): School[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      if (data) {
        const parsed: School[] = JSON.parse(data);
        const existingIds = new Set(parsed.map(s => s.id));
        const missingSchools = INITIAL_SCHOOLS.filter(s => !existingIds.has(s.id));
        const updated = [...parsed, ...missingSchools];
        const pilar = updated.find(s => s.id === 'capsu-pilar');
        if (pilar) {
          pilar.lat = 11.4840;
          pilar.lng = 123.0051;
        }
        localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(updated));
        return updated;
      }
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(INITIAL_SCHOOLS));
    return INITIAL_SCHOOLS;
  },

  saveSchools(schools: School[]) {
    localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools));
  },

  addSchool(schoolData: Omit<School, 'id'>, adminUser?: User): { success: boolean; school?: School; error?: string } {
    if (!isCoordinateWithinCapiz(schoolData.lat, schoolData.lng)) {
      return {
        success: false,
        error: 'Campus coordinates must be located within Capiz, Philippines.'
      };
    }
    const newSchool: School = {
      ...schoolData,
      id: `school-${Date.now()}`,
      totalNearbyProperties: 0,
    };
    const schools = this.getSchools();
    schools.push(newSchool);
    this.saveSchools(schools);

    this.addAuditLog({
      adminId: adminUser?.id || 'admin',
      adminName: adminUser?.name || 'Administrator',
      action: 'Campus Added to Directory',
      targetId: newSchool.id,
      targetType: 'school',
      notes: `${newSchool.name} in ${newSchool.municipality}`
    });

    return { success: true, school: newSchool };
  },

  // Favorites
  getFavorites(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  toggleFavorite(propertyId: string): boolean {
    const favs = this.getFavorites();
    const index = favs.indexOf(propertyId);
    let isFav = false;
    if (index >= 0) {
      favs.splice(index, 1);
      isFav = false;
    } else {
      favs.push(propertyId);
      isFav = true;
    }
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  },

  isFavorite(propertyId: string): boolean {
    return this.getFavorites().includes(propertyId);
  },

  // Comparisons
  getComparisons(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPARISONS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [];
  },

  toggleComparison(propertyId: string): { inComparison: boolean; message?: string } {
    const list = this.getComparisons();
    const index = list.indexOf(propertyId);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(list));
      return { inComparison: false };
    }
    if (list.length >= 3) {
      return { inComparison: false, message: 'You can compare up to 3 properties at once. Please remove one first.' };
    }
    list.push(propertyId);
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify(list));
    return { inComparison: true };
  },

  clearComparisons() {
    localStorage.setItem(STORAGE_KEYS.COMPARISONS, JSON.stringify([]));
  },

  isInComparison(propertyId: string): boolean {
    return this.getComparisons().includes(propertyId);
  },

  // Conversations & Messaging
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(INITIAL_CONVERSATIONS));
    return INITIAL_CONVERSATIONS;
  },

  saveConversations(conversations: Conversation[]) {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  getMessages(conversationId: string): Message[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (data) {
        const all: Message[] = JSON.parse(data);
        return all.filter(m => m.conversationId === conversationId);
      }
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    return INITIAL_MESSAGES.filter(m => m.conversationId === conversationId);
  },

  sendMessage(conversationId: string, sender: User, text: string): Message {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    let allMessages: Message[] = [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      allMessages = data ? JSON.parse(data) : INITIAL_MESSAGES;
    } catch {
      allMessages = INITIAL_MESSAGES;
    }
    allMessages.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));

    // Update conversation metadata
    const conversations = this.getConversations();
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.lastMessageText = text;
      conv.lastMessageTimestamp = newMsg.timestamp;
      if (sender.role === 'student') {
        conv.unreadCountOwner += 1;
      } else {
        conv.unreadCountStudent += 1;
      }
      this.saveConversations(conversations);
    }

    return newMsg;
  },

  startOrGetConversation(property: Property, student: User, initialMessageText?: string): Conversation {
    const conversations = this.getConversations();
    let conv = conversations.find(c => c.propertyId === property.id && c.studentId === student.id);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        propertyId: property.id,
        propertyName: property.name,
        studentId: student.id,
        studentName: student.name,
        ownerId: property.ownerId,
        ownerName: property.ownerName,
        lastMessageText: initialMessageText || 'Inquiry initiated',
        lastMessageTimestamp: new Date().toISOString(),
        unreadCountStudent: 0,
        unreadCountOwner: 1,
      };
      conversations.unshift(conv);
      this.saveConversations(conversations);

      if (initialMessageText) {
        this.sendMessage(conv.id, student, initialMessageText);
      }
    }
    return conv;
  },

  // Reports
  getReports(): PropertyReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const initialReport: PropertyReport[] = [];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(initialReport));
    return initialReport;
  },

  submitReport(report: Omit<PropertyReport, 'id' | 'status' | 'createdAt'>) {
    const newReport: PropertyReport = {
      ...report,
      id: `rep-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const reports = this.getReports();
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

    this.addAuditLog({
      adminId: 'system',
      adminName: 'Student Report',
      action: 'Listing Reported for Review',
      targetId: report.propertyId,
      targetType: 'property',
      notes: `Reason: ${report.reason}`
    });
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const initialLogs: AuditLog[] = [
      {
        id: 'log-01',
        adminId: 'user-admin-01',
        adminName: 'Atty. Mark Roxas',
        action: 'Verified Listing Location',
        targetId: 'prop-pilar-01',
        targetType: 'property',
        timestamp: '2026-09-16T10:00:00Z',
        notes: 'Confirmed coordinates 11.4891, 122.9972 at Natividad, Pilar near CAPSU Pilar',
      },
      {
        id: 'log-02',
        adminId: 'user-admin-01',
        adminName: 'Atty. Mark Roxas',
        action: 'Verified School Coordinates',
        targetId: 'capsu-pilar',
        targetType: 'school',
        timestamp: '2026-09-01T09:00:00Z',
        notes: 'CAPSU Pilar Satellite College verified in Natividad, Pilar, Capiz',
      }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
    return initialLogs;
  },

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const logs = this.getAuditLogs();
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  // ===================== AUTH & USER MANAGEMENT =====================
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      if (data) {
        const parsed: User[] = JSON.parse(data);
        // Ensure fixed admin account is always present and up to date
        const adminIndex = parsed.findIndex(u => u.email.toLowerCase() === 'admin@board.com');
        if (adminIndex >= 0) {
          parsed[adminIndex] = {
            ...parsed[adminIndex],
            email: 'admin@board.com',
            password: 'admin123',
            role: 'admin',
          };
        } else {
          parsed.unshift(FIXED_ADMIN_ACCOUNT);
        }
        return parsed;
      }
    } catch {
      // ignore
    }

    // Default only has the fixed admin account! No demo accounts per requirements.
    const initialUsers: User[] = [FIXED_ADMIN_ACCOUNT];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
    return initialUsers;
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getCurrentUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // Check fixed admin account directly
    if (cleanEmail === 'admin@board.com') {
      if (cleanPassword === 'admin123') {
        this.setCurrentUser(FIXED_ADMIN_ACCOUNT);
        this.addAuditLog({
          adminId: FIXED_ADMIN_ACCOUNT.id,
          adminName: FIXED_ADMIN_ACCOUNT.name,
          action: 'Admin Logged In',
          targetId: FIXED_ADMIN_ACCOUNT.id,
          targetType: 'user',
          notes: 'Successful login to Capiz BH Admin Console',
        });
        return { success: true, user: FIXED_ADMIN_ACCOUNT };
      } else {
        return { success: false, error: 'Incorrect password for admin account.' };
      }
    }

    // Check registered users
    const users = this.getUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      return { success: false, error: 'No account found with this email. Please register first.' };
    }

    if (foundUser.password !== cleanPassword) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    this.setCurrentUser(foundUser);
    return { success: true, user: foundUser };
  },

  registerUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'owner';
    phone?: string;
    preferredSchoolId?: string;
    businessName?: string;
  }): { success: boolean; user?: User; error?: string } {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password.trim();

    if (!cleanName) return { success: false, error: 'Name is required.' };
    if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'A valid email address is required.' };
    if (!cleanPassword || cleanPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    if (cleanEmail === 'admin@board.com') {
      return { success: false, error: 'admin@board.com is a reserved system administrator account.' };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists. Please log in instead.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: data.role,
      phone: data.phone?.trim() || '',
      createdAt: new Date().toISOString(),
      preferredSchoolId: data.role === 'student' ? data.preferredSchoolId : undefined,
      businessName: data.role === 'owner' ? data.businessName?.trim() : undefined,
      isVerifiedOwner: data.role === 'owner' ? false : undefined,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    this.addAuditLog({
      adminId: 'system',
      adminName: 'Registration Service',
      action: `New ${data.role === 'owner' ? 'BH Owner' : 'Student'} Registered`,
      targetId: newUser.id,
      targetType: 'user',
      notes: `${newUser.name} (${newUser.email}) in Capiz`,
    });

    return { success: true, user: newUser };
  },

  logout() {
    this.setCurrentUser(null);
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      this.saveUsers(users);

      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedCurrent = { ...currentUser, ...updates };
        this.setCurrentUser(updatedCurrent);
        return updatedCurrent;
      }
      return users[index];
    }
    return undefined;
  },

  verifyOwner(ownerId: string, isVerified: boolean) {
    this.updateUser(ownerId, { isVerifiedOwner: isVerified });
    // Also update any properties owned by this owner
    const properties = this.getProperties();
    let updated = false;
    properties.forEach(p => {
      if (p.ownerId === ownerId) {
        p.isOwnerVerified = isVerified;
        updated = true;
      }
    });
    if (updated) {
      this.saveProperties(properties);
    }
  },

  deleteProperty(propertyId: string, actingUser?: User): boolean {
    const properties = this.getProperties();
    const index = properties.findIndex(p => p.id === propertyId);
    if (index >= 0) {
      const removed = properties.splice(index, 1)[0];
      this.saveProperties(properties);

      this.addAuditLog({
        adminId: actingUser?.id || 'system',
        adminName: actingUser?.name || 'Owner/Admin',
        action: 'Listing Deleted',
        targetId: propertyId,
        targetType: 'property',
        notes: `Property "${removed.name}" removed from platform`,
      });
      return true;
    }
    return false;
  },

  updateProperty(propertyId: string, updates: Partial<Property>, actingUser?: User): boolean {
    const properties = this.getProperties();
    const prop = properties.find(p => p.id === propertyId);
    if (prop) {
      Object.assign(prop, updates, { updatedAt: new Date().toISOString() });
      this.saveProperties(properties);

      this.addAuditLog({
        adminId: actingUser?.id || 'system',
        adminName: actingUser?.name || 'Owner/Admin',
        action: 'Listing Updated',
        targetId: propertyId,
        targetType: 'property',
        notes: `Property "${prop.name}" details updated`,
      });
      return true;
    }
    return false;
  },

  updateReportStatus(reportId: string, status: 'pending' | 'reviewed' | 'dismissed', adminUser?: User) {
    const reports = this.getReports();
    const rep = reports.find(r => r.id === reportId);
    if (rep) {
      rep.status = status;
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));

      this.addAuditLog({
        adminId: adminUser?.id || 'admin',
        adminName: adminUser?.name || 'Administrator',
        action: `Report Marked as ${status.toUpperCase()}`,
        targetId: reportId,
        targetType: 'property',
        notes: `Report on ${rep.propertyName}`,
      });
    }
  },

  getStudentConversations(studentId: string): Conversation[] {
    return this.getConversations().filter(c => c.studentId === studentId);
  },

  getOwnerConversations(ownerId: string): Conversation[] {
    return this.getConversations().filter(c => c.ownerId === ownerId);
  },

  // Student Booking & Reservation Requests
  getReservations(): ReservationRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      if (data) {
        return JSON.parse(data) as ReservationRequest[];
      }
    } catch {
      // ignore
    }
    return [];
  },

  getStudentReservations(studentId: string): ReservationRequest[] {
    return this.getReservations().filter(r => r.studentId === studentId);
  },

  getOwnerReservations(ownerId: string): ReservationRequest[] {
    return this.getReservations().filter(r => r.ownerId === ownerId);
  },

  createReservation(
    req: Omit<ReservationRequest, 'id' | 'createdAt' | 'status'>
  ): ReservationRequest {
    const reservations = this.getReservations();
    const newReservation: ReservationRequest = {
      ...req,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reservations.unshift(newReservation);
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));

    // Also auto-create or post a message in the conversation between student and owner
    const prop = this.getProperties().find(p => p.id === req.propertyId);
    if (prop) {
      const studentUser: User = {
        id: req.studentId,
        name: req.studentName,
        email: req.studentEmail,
        phone: req.studentPhone,
        role: 'student',
        createdAt: new Date().toISOString(),
      };
      const moveInText = `📌 RESERVATION REQUEST:\nNais ko pong magpareserba sa ${req.propertyName}.\n• Target Move-in: ${req.targetMoveInDate} (${req.targetSemester})\n• Room Type: ${req.preferredRoomType}\n• Occupants: ${req.occupantsCount}\n• Duration: ${req.stayDuration}\n${req.notes ? `• Note: ${req.notes}` : ''}`;
      this.startOrGetConversation(prop, studentUser, moveInText);
    }

    return newReservation;
  },

  updateReservationStatus(
    reservationId: string,
    status: ReservationRequest['status'],
    actingUser?: User
  ): boolean {
    const reservations = this.getReservations();
    const res = reservations.find(r => r.id === reservationId);
    if (res) {
      res.status = status;
      localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));

      this.addAuditLog({
        adminId: actingUser?.id || 'owner',
        adminName: actingUser?.name || 'Owner',
        action: `Reservation ${status.toUpperCase()}`,
        targetId: reservationId,
        targetType: 'property',
        notes: `Reservation for ${res.propertyName} by ${res.studentName} updated to ${status}`,
      });
      return true;
    }
    return false;
  },

  // Reviews & Star-Rating System
  getReviews(): PropertyReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      if (data) {
        const parsed = JSON.parse(data) as PropertyReview[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  },

  togglePropertyVerification(propertyId: string, adminUser?: User): boolean {
    const properties = this.getProperties();
    const index = properties.findIndex((p) => p.id === propertyId);
    if (index >= 0) {
      const current = Boolean(properties[index].isVerifiedListing ?? properties[index].isOwnerVerified);
      const nextStatus = !current;
      properties[index].isVerifiedListing = nextStatus;
      properties[index].updatedAt = new Date().toISOString();
      this.saveProperties(properties);
      this.addAuditLog({
        adminId: adminUser?.id || 'admin',
        adminName: adminUser?.name || 'Capiz Admin',
        action: nextStatus ? 'VERIFY_LISTING' : 'UNVERIFY_LISTING',
        targetId: propertyId,
        targetType: 'property',
        notes: `Listing "${properties[index].name}" verification changed to ${nextStatus ? 'VERIFIED' : 'UNVERIFIED'}`,
      });
      return true;
    }
    return false;
  },

  getPropertyReviews(propertyId: string): PropertyReview[] {
    return this.getReviews()
      .filter((r) => r.propertyId === propertyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getStudentReviews(studentId: string): PropertyReview[] {
    return this.getReviews()
      .filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  hasStudentReviewed(propertyId: string, studentId: string): boolean {
    return this.getReviews().some((r) => r.propertyId === propertyId && r.studentId === studentId);
  },

  submitReview(
    reviewData: Omit<PropertyReview, 'id' | 'createdAt'>
  ): { success: boolean; review?: PropertyReview; error?: string } {
    // Rating must be between 1 and 5
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: 'Pumili ng rating mula 1 hanggang 5 bituin (stars).' };
    }

    if (!reviewData.comment || reviewData.comment.trim().length < 5) {
      return { success: false, error: 'Maglagay ng maikling komento o paliwanag (kahit 5 letra man lang).' };
    }

    const reviews = this.getReviews();
    const existingIndex = reviews.findIndex(
      (r) => r.propertyId === reviewData.propertyId && r.studentId === reviewData.studentId
    );

    let savedReview: PropertyReview;

    if (existingIndex >= 0) {
      // Update existing review
      savedReview = {
        ...reviews[existingIndex],
        ...reviewData,
        updatedAt: new Date().toISOString(),
      };
      reviews[existingIndex] = savedReview;
    } else {
      // Create new review
      savedReview = {
        ...reviewData,
        id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
      };
      reviews.unshift(savedReview);
    }

    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Recalculate and update the property's averageRating and totalReviews
    this.recalculatePropertyRatings(reviewData.propertyId);

    // Audit log
    this.addAuditLog({
      adminId: reviewData.studentId,
      adminName: reviewData.studentName,
      action: existingIndex >= 0 ? 'UPDATE_REVIEW' : 'SUBMIT_REVIEW',
      targetId: reviewData.propertyId,
      targetType: 'property',
      notes: `Student ${reviewData.studentName} rated ${reviewData.propertyName || reviewData.propertyId} with ${reviewData.rating} stars`,
    });

    return { success: true, review: savedReview };
  },

  deleteReview(reviewId: string, studentId: string): boolean {
    const reviews = this.getReviews();
    const reviewToDelete = reviews.find((r) => r.id === reviewId && r.studentId === studentId);
    if (!reviewToDelete) return false;

    const remaining = reviews.filter((r) => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(remaining));

    this.recalculatePropertyRatings(reviewToDelete.propertyId);
    return true;
  },

  recalculatePropertyRatings(propertyId: string) {
    const propertyReviews = this.getPropertyReviews(propertyId);
    const properties = this.getProperties();
    const propIndex = properties.findIndex((p) => p.id === propertyId);

    if (propIndex >= 0) {
      const total = propertyReviews.length;
      if (total === 0) {
        properties[propIndex].averageRating = undefined;
        properties[propIndex].totalReviews = 0;
      } else {
        const sum = propertyReviews.reduce((acc, r) => acc + r.rating, 0);
        properties[propIndex].averageRating = Number((sum / total).toFixed(1));
        properties[propIndex].totalReviews = total;
      }
      this.saveProperties(properties);
    }
  },

  calculateRatingSummary(propertyId: string) {
    const reviews = this.getPropertyReviews(propertyId);
    const total = reviews.length;

    if (total === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        categories: {
          cleanliness: 0,
          safety: 0,
          landlord: 0,
          value: 0,
        },
      };
    }

    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / total).toFixed(1));

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let cleanlinessSum = 0;
    let cleanlinessCount = 0;
    let safetySum = 0;
    let safetyCount = 0;
    let landlordSum = 0;
    let landlordCount = 0;
    let valueSum = 0;
    let valueCount = 0;

    reviews.forEach((r) => {
      const whole = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[whole] = (distribution[whole] || 0) + 1;

      if (r.cleanlinessRating) {
        cleanlinessSum += r.cleanlinessRating;
        cleanlinessCount++;
      }
      if (r.safetyRating) {
        safetySum += r.safetyRating;
        safetyCount++;
      }
      if (r.landlordRating) {
        landlordSum += r.landlordRating;
        landlordCount++;
      }
      if (r.valueRating) {
        valueSum += r.valueRating;
        valueCount++;
      }
    });

    const percentages: Record<number, number> = {
      5: Math.round((distribution[5] / total) * 100),
      4: Math.round((distribution[4] / total) * 100),
      3: Math.round((distribution[3] / total) * 100),
      2: Math.round((distribution[2] / total) * 100),
      1: Math.round((distribution[1] / total) * 100),
    };

    return {
      average,
      total,
      distribution,
      percentages,
      categories: {
        cleanliness: cleanlinessCount > 0 ? Number((cleanlinessSum / cleanlinessCount).toFixed(1)) : average,
        safety: safetyCount > 0 ? Number((safetySum / safetyCount).toFixed(1)) : average,
        landlord: landlordCount > 0 ? Number((landlordSum / landlordCount).toFixed(1)) : average,
        value: valueCount > 0 ? Number((valueSum / valueCount).toFixed(1)) : average,
      },
    };
  },
};
