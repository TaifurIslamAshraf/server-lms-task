import  arctic from "arctic";

export const state = arctic.generateState();
export const codeVerifier = arctic.generateCodeVerifier();
export const scopes = ["openid", "profile"];
