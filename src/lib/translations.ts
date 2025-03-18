export type TranslationKey =
  | "dashboard"
  | "sessions"
  | "feedback"
  | "supervisors"
  | "notifications"
  | "settings"
  | "help"
  | "profile"
  | "logout"
  | "darkMode"
  | "lightMode"
  | "light_mode"
  | "dark_mode"
  | "language"
  | "english"
  | "korean"
  | "my_sessions"
  | "in_progress"
  | "pending_review"
  | "search_placeholder"
  | "no_results_found"
  | "my_account"
  | "accountSettings"
  | "notificationSettings"
  | "audioSettings"
  | "appearanceSettings"
  | "privacySettings"
  | "saveChanges"
  | "fullName"
  | "emailAddress"
  | "phoneNumber"
  | "password"
  | "currentPassword"
  | "newPassword"
  | "confirmPassword"
  | "updatePassword"
  | "emailNotifications"
  | "pushNotifications"
  | "feedbackNotifications"
  | "requestNotifications"
  | "systemNotifications"
  | "autoPlayAudio"
  | "defaultVolume"
  | "highContrastMode"
  | "shareUsageData"
  | "twoFactorAuth"
  | "deleteAccount"
  | "uploadSession"
  | "viewSessions"
  | "sessionTitle"
  | "sessionType"
  | "selectSupervisor"
  | "sessionNotes"
  | "audioRecording"
  | "requestFeedback"
  | "allFeedback"
  | "textFeedback"
  | "audioFeedback"
  | "recentFeedback"
  | "searchFeedback"
  | "noFeedbackFound"
  | "markAllAsRead"
  | "noNotifications"
  | "aboutMe"
  | "recentSessions"
  | "certifications"
  | "statistics"
  | "totalSessions"
  | "totalFeedback"
  | "avgSession"
  | "completionRate"
  | "editProfile"
  | "specialization"
  | "experience"
  | "joined";

type TranslationDictionary = {
  [key in TranslationKey]: string;
};

type Translations = {
  en: TranslationDictionary;
  ko: TranslationDictionary;
};

export const translations: Translations = {
  en: {
    dashboard: "Dashboard",
    sessions: "Sessions",
    feedback: "Feedbacks",
    supervisors: "Supervisors",
    notifications: "Notifications",
    settings: "Settings",
    help: "Help",
    profile: "Profile",
    logout: "Log out",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    dark_mode: "Dark Mode",
    light_mode: "Light Mode",
    my_sessions: "My Sessions",
    in_progress: "In Progress",
    pending_review: "Pending Review",
    search_placeholder: "Search sessions or feedback...",
    no_results_found: "No results found",
    my_account: "My Account",
    language: "Language",
    english: "English",
    korean: "Korean",
    accountSettings: "Account Settings",
    notificationSettings: "Notification Settings",
    audioSettings: "Audio Settings",
    appearanceSettings: "Appearance Settings",
    privacySettings: "Privacy Settings",
    saveChanges: "Save Changes",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    password: "Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    updatePassword: "Update Password",
    emailNotifications: "Email Notifications",
    pushNotifications: "Push Notifications",
    feedbackNotifications: "Feedback Notifications",
    requestNotifications: "Request Notifications",
    systemNotifications: "System Notifications",
    autoPlayAudio: "Auto-play audio when session opens",
    defaultVolume: "Default Volume",
    highContrastMode: "High Contrast Mode",
    shareUsageData: "Share anonymous usage data to help improve the platform",
    twoFactorAuth: "Two-Factor Authentication",
    deleteAccount: "Delete Account",
    uploadSession: "Upload Session",
    viewSessions: "View Sessions",
    sessionTitle: "Session Title",
    sessionType: "Session Type",
    selectSupervisor: "Select Supervisor",
    sessionNotes: "Session Notes",
    audioRecording: "Audio Recording",
    requestFeedback: "Request Feedback",
    allFeedback: "All Feedback",
    textFeedback: "Text Feedback",
    audioFeedback: "Audio Feedback",
    recentFeedback: "Recent Feedback",
    searchFeedback: "Search feedback...",
    noFeedbackFound: "No feedback found",
    markAllAsRead: "Mark all as read",
    noNotifications: "No notifications",
    aboutMe: "About Me",
    recentSessions: "Recent Sessions",
    certifications: "Certifications",
    statistics: "Statistics",
    totalSessions: "Total Sessions",
    totalFeedback: "Total Feedback",
    avgSession: "Avg. Session",
    completionRate: "Completion Rate",
    editProfile: "Edit Profile",
    specialization: "Specialization",
    experience: "Experience",
    joined: "Joined",
  },
  ko: {
    dashboard: "대시보드",
    sessions: "세션",
    feedback: "피드백들",
    supervisors: "슈퍼바이저",
    notifications: "알림",
    settings: "설정",
    help: "도움말",
    profile: "프로필",
    logout: "로그아웃",
    darkMode: "다크 모드",
    lightMode: "라이트 모드",
    dark_mode: "다크 모드",
    light_mode: "라이트 모드",
    my_sessions: "내 세션",
    in_progress: "진행 중",
    pending_review: "검토 대기 중",
    search_placeholder: "세션 또는 피드백 검색...",
    no_results_found: "검색 결과가 없습니다",
    my_account: "내 계정",
    language: "언어",
    english: "영어",
    korean: "한국어",
    accountSettings: "계정 설정",
    notificationSettings: "알림 설정",
    audioSettings: "오디오 설정",
    appearanceSettings: "외관 설정",
    privacySettings: "개인 정보 설정",
    saveChanges: "변경 사항 저장",
    fullName: "이름",
    emailAddress: "이메일 주소",
    phoneNumber: "전화번호",
    password: "비밀번호",
    currentPassword: "현재 비밀번호",
    newPassword: "새 비밀번호",
    confirmPassword: "비밀번호 확인",
    updatePassword: "비밀번호 업데이트",
    emailNotifications: "이메일 알림",
    pushNotifications: "푸시 알림",
    feedbackNotifications: "피드백 알림",
    requestNotifications: "요청 알림",
    systemNotifications: "시스템 알림",
    autoPlayAudio: "세션 열 때 오디오 자동 재생",
    defaultVolume: "기본 볼륨",
    highContrastMode: "고대비 모드",
    shareUsageData: "플랫폼 개선을 위해 익명 사용 데이터 공유",
    twoFactorAuth: "이중 인증",
    deleteAccount: "계정 삭제",
    uploadSession: "세션 업로드",
    viewSessions: "세션 보기",
    sessionTitle: "세션 제목",
    sessionType: "세션 유형",
    selectSupervisor: "슈퍼바이저 선택",
    sessionNotes: "세션 노트",
    audioRecording: "오디오 녹음",
    requestFeedback: "피드백 요청",
    allFeedback: "모든 피드백",
    textFeedback: "텍스트 피드백",
    audioFeedback: "오디오 피드백",
    recentFeedback: "최근 피드백",
    searchFeedback: "피드백 검색...",
    noFeedbackFound: "피드백을 찾을 수 없습니다",
    markAllAsRead: "모두 읽음으로 표시",
    noNotifications: "알림 없음",
    aboutMe: "자기소개",
    recentSessions: "최근 세션",
    certifications: "자격증",
    statistics: "통계",
    totalSessions: "총 세션",
    totalFeedback: "총 피드백",
    avgSession: "평균 세션",
    completionRate: "완료율",
    editProfile: "프로필 편집",
    specialization: "전문 분야",
    experience: "경력",
    joined: "가입일",
  },
};
