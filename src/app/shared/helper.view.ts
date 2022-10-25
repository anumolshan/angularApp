import { Injectable } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { DatePipe } from '@angular/common';



@Injectable()
export class HelperView {

  static checkStringEmptyOrNull(value) {

    if (value === null || value === undefined || value === '') {
      return false;
    } else {
      return true;
    }
  }
  static isValidMailFormat(email) {

    const emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (email !== undefined && email !== '' && (email.length <= 5 || !emailRegex.test(email))) {
      return false;
    }
    return true;
  }
  static isValidNumber(num) {

    const numRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g;    // eg: +(123) 456-7890  , (123) 456-7890 , +31636363634
    if (num !== undefined && num !== '' && !numRegex.test(num)) {
      return false;
    }
    return true;
  }
  static isValidAmountFormat(amount) {

    const regex = /^\d{1,10}(\.\d{1,2})?$/;
    if (regex.test(amount.toString())) {
      return false;
    }
    return true;
  }


}
