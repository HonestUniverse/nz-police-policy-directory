declare enum NoticeType {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
}

export type Notice = {
	type: NoticeType,
	title?: string,
	message: string,
};
