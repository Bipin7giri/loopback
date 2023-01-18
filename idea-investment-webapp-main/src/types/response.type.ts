export type SUCCESS_RESPONSE = {
  success: {
    statusCode: number;
    message: string;
  };
};

export type FAIL_RESPONSE = {
  fail: {
    statusCode: number;
    message: string;
  };
};
