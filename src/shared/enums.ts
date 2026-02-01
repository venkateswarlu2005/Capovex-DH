export enum AuthProvider {
	Credentials = 'CREDENTIALS',
	Auth0 = 'AUTH0',
	Google = 'GOOGLE',
}

export enum UserStatus {
	Active = 'ACTIVE',
	Archived = 'ARCHIVED',
	Unverified = 'UNVERIFIED',
}

// UPDATED: The 4 new roles
export enum UserRole {
	MasterAdmin = 'MASTER_ADMIN',
	DeptAdmin = 'DEPT_ADMIN',
	DeptUser = 'DEPT_USER',
	ViewOnlyUser = 'VIEW_ONLY_USER',
}

export enum AnalyticsEventType {
	VIEW = 'VIEW',
	DOWNLOAD = 'DOWNLOAD',
}

export enum LoadPhase {
	Idle = 'idle',
	Bundle = 'bundle',
	Img = 'img',
	Pdf = 'pdf',
	Done = 'done',
}
export enum RequestStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	REJECTED = 'REJECTED',
}

export enum RequestType {
	CREATE_CATEGORY = 'CREATE_CATEGORY',
	ACCESS_DOCUMENT = 'ACCESS_DOCUMENT',
	OTHER = 'OTHER',
}
