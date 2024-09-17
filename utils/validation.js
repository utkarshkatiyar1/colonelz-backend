export const onlyAlphabetsValidation = (NameToCheck) => {
  let regex = /^[A-Za-z _]*$/;
  return regex.test(NameToCheck);
};
export const onlyMomClientsValidation = (NameToCheck) => {
  let regex = /^([A-Za-z]+(?: [A-Za-z]+)*)(, [A-Za-z]+(?: [A-Za-z]+)*)*$/;
  return regex.test(NameToCheck);
};

export const onlyEmailValidation = (emailforValidation) => {
  if (
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailforValidation)
  ) {
    return true;
  }
  return false;
};

export const onlyPasswordPatternValidation = (pass_word) => {
  let passwordCheck = new RegExp(
    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,25}$/
  );
  if (passwordCheck.test(pass_word)) {
    return true;
  }
  return false;
};

export const onlyPhoneNumberValidation = (num_ber) => {
  // Regular expression to match phone numbers with optional country code, spaces, and dashes, up to 20 characters total
  const phoneNumber = /^(\+?\d{1,3}\s?)?\d{1,4}([\s-]?\d{1,4}){1,4}$/;

  // Remove all spaces and dashes for length validation
  const cleanedNumber = num_ber.replace(/[\s-]/g, '');

  // Check if the number matches the regular expression and its length does not exceed 20 characters
  if (phoneNumber.test(num_ber) && cleanedNumber.length <= 20) {
    return true;
  }
  return false;
};


export const onlyOrgValidation = (org)=>{
  let regex = /^[a-zA-Z.]+$/
  if(regex.test(org))
    {
      return true;
    }
}

export const validateOnlyNumbers = (input) => {
  const numberRegex = /^[0-9]+$/;

  if (numberRegex.test(input)) {
    return true;  
  }
  return false;
}
