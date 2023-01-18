import {SchemaObject} from '@loopback/rest';
import {GENDER} from '../../enums';

const RegisterCredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password', 'phone'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    phone: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
    userFireBaseId: {
      type: 'string',
    },
  },
};

const UpdateUserSchema: SchemaObject = {
  type: 'object',
  required: ['firstName', 'lastName', 'email', 'password'],
  properties: {
    fullName: {
      type: 'string',
    },
    phone: {
      type: 'string',
      minLength: 10,
      maxLength: 14,
    },
    email: {
      type: 'string',
      format: 'email',
    },
    gender: {
      type: 'string',
      enum: [GENDER.male, GENDER.female, GENDER.other],
    },
    DOB: {
      type: 'string',
      format: 'date',
    },
    address: {
      type: 'object',
      required: ['country', 'address'],
      properties: {
        country: {
          type: 'string',
        },
        postcode: {
          type: 'string',
        },
        address: {
          type: 'string',
        },
      },
    },
    profilePictureId: {
      type: 'number',
    },
  },
};

const LoginCredentialsSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

const VerificationRequestSchema: SchemaObject = {
  type: 'object',
  required: ['email', 'token'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    token: {
      type: 'number',
    },
  },
};

const ReSendVerificationRequestSchema: SchemaObject = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

const ForgotPasswordSchema: SchemaObject = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
  },
};

export const ForgotPasswordRequestBody = {
  description: 'The input of password reset function',
  required: true,
  content: {
    'application/json': {schema: ForgotPasswordSchema},
  },
};

const ResetPasswordSchema: SchemaObject = {
  type: 'object',
  required: ['email'],
  properties: {
    email: {
      type: 'string',
      format: 'email',
    },
    token: {
      type: 'number',
    },
    password: {
      type: 'string',
      minLength: 8,
    },
  },
};

const GoogleLoginSchema: SchemaObject = {
  type: 'object',
  required: ['token'],
  properties: {
    token: {
      type: 'string',
    },
  },
};

export const ResetPasswordRequestBody = {
  description: 'The input of password reset function',
  required: true,
  content: {
    'application/json': {schema: ResetPasswordSchema},
  },
};

export const RegisterUserRequest = {
  description: 'The input of register user function',
  required: true,
  content: {
    'application/json': {schema: RegisterCredentialsSchema},
  },
};

export const LoginUserRequest = {
  description: 'The input of login user function',
  required: true,
  content: {
    'application/json': {schema: LoginCredentialsSchema},
  },
};

export const UpdateUserRequest = {
  description: 'The input of register user function',
  required: true,
  content: {
    'application/json': {schema: UpdateUserSchema},
  },
};

export const VerificationRequest = {
  description: 'The input of user verification function',
  required: true,
  content: {
    'application/json': {schema: VerificationRequestSchema},
  },
};

export const ReSendVerificationRequest = {
  description: 'The input of user re-send verification function',
  required: true,
  content: {
    'application/json': {schema: ReSendVerificationRequestSchema},
  },
};

export const GoogleLoginRequest = {
  description: 'The input of google login function',
  required: true,
  content: {
    'application/json': {schema: GoogleLoginSchema},
  },
};
