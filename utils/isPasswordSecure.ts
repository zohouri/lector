const legalCharactersPattern = /^[a-zA-Z0-9!@#$&*]*$/;
const digitPattern = /\d+/;
const lowercasePattern = /[a-z]+/;
const uppercasePattern = /[A-Z]+/;
const specialCharacterPattern = /[!@#$&*]+/;

type OptionsType = {
    minLength?: number;
    maxLength?: number;
    checkDigit?: boolean;
    checkLowercase?: boolean;
    checkUppercase?: boolean;
    checkSpecialCharacter?: boolean;
};

const defaultOptions = {
    minLength: 8,
    maxLength: 32,
    checkDigit: true,
    checkLowercase: true,
    checkUppercase: true,
    checkSpecialCharacter: true
};

const isPasswordSecure = (
    password: string,
    options: OptionsType = defaultOptions
): Error | true => {
    const newOptions = {
        ...defaultOptions,
        ...options
    };

    if (typeof password !== 'string') {
        throw new Error('Password must be type of string!');
    }

    if (!legalCharactersPattern.test(password)) {
        throw new Error('Password contains illegal character');
    }

    if (password.length < newOptions.minLength) {
        throw new Error(`Password length must be greater than ${newOptions.minLength}`);
    }

    if (password.length > newOptions.maxLength) {
        throw new Error(`Password length must be less than ${newOptions.maxLength}`);
    }

    if (newOptions.checkDigit && !digitPattern.test(password)) {
        throw new Error('Password must contains at least 1 digit (0-9)');
    }

    if (newOptions.checkLowercase && !lowercasePattern.test(password)) {
        throw new Error('Password must contains at least 1 lowercase letter (a-z)');
    }

    if (newOptions.checkUppercase && !uppercasePattern.test(password)) {
        throw new Error('Password must contains at least 1 uppercase letter (A-Z)');
    }

    if (newOptions.checkSpecialCharacter && !specialCharacterPattern.test(password)) {
        throw new Error('Password must contains at least 1 special character (!@#$&*)');
    }

    return true;
};

export default isPasswordSecure;
