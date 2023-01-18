
export type VERIFICATION = {
  email: string,
  token: number,
}

export type RESEND_VERIFICATION = {
  email: string
}

export type RESET_PASSWORD = {
  email: string,
  password: string,
  token: number,
}
