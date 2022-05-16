export enum USER_PROVIDER {
  PASSWORD = 'password',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}
export enum COOKIE_CONSENT {
  NONE = 'none',
  BASIC = 'basic',
  SOCIAL_MEDIA = 'social_media',
}
export type UserProviderSocial = USER_PROVIDER.FACEBOOK | USER_PROVIDER.GOOGLE;
export type UserSocial = {
  emailAddress?: string;
  firstName: string;
  lastName: string;
  provider: UserProviderSocial;
  providerId: string | null;
  profileImageUrl: string;
};
