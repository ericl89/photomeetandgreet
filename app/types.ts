

export type MemberType = "GROUP_ADMIN" | "SUPER_ADMIN" | "MEMBER";

export type AccessPayload = {
    sub: string;               // member id
    memberType?: MemberType; // middleware might need it
    ver?: number;              // token/version for forced logout
};

export type SignUpInputs = {
    firstName: string
    lastName: string
    role: string
    workingName?: string
    emailAddress: string
    instagram?: string
    tiktok?: string
    facebook?: string
    twitter?: string
    password: string
    passwordConfirm: string
}

export type AdminLoginInputs = {
    emailAddress: string
    password: string
}

export type MemberIdentity = { id: number; type: MemberType };
