export function validateCardDetails({
  fName,
  lName,
  phoneNumber,
  cardNumber,
  expiryDate,
  cvv,
}) {
  const nameRegex = /^[A-Za-z\s]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;
  const cardRegex = /^[0-9]{16}$/;
  const cvvRegex = /^[0-9]{3,4}$/;
  const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/; // MM/YY format

  console.log(fName, lName, phoneNumber, cardNumber, expiryDate, cvv);
  // Validate Name
  if (!nameRegex.test(fName) || !nameRegex.test(lName)) {
    return false;
  }

  // Validate Phone Number
  if (!phoneRegex.test(phoneNumber)) {
    return false;
  }

  // Validate Card Number
  if (!cardRegex.test(cardNumber)) {
    return false;
  }

  // Validate Expiry Date
  if (!expiryRegex.test(expiryDate)) {
    return false;
  } else {
    const [month, year] = expiryDate.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
  }

  // Validate CVV
  if (!cvvRegex.test(cvv)) {
    return false;
  }

  return true;
}
