import { CookieOptions, Request, Response } from 'express';

export const setCookie = (
  response: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  response.cookie(key, value, options);
};
export const getCookie = (
  request: Request,
  key: string,
): string | undefined => {
  return request.cookies[key] as string | undefined;
};

export const deleteCookie = (response: Response, key: string) => {
  response.clearCookie(key);
};
