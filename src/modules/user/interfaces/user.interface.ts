export enum UserProvider {
  PASSWORD = 'password',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}
export enum CookieConsent {
  NONE = 'none',
  BASIC = 'basic',
  SOCIAL_MEDIA = 'social_media',
}
export type UserProviderSocial = UserProvider.FACEBOOK | UserProvider.GOOGLE;
export type UserSocial = {
  emailAddress?: string;
  firstName: string;
  lastName: string;
  provider: UserProviderSocial;
  providerId: string | null;
  profileImageUrl: string;
};
