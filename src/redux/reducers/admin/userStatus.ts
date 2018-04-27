import { AnyAction } from 'redux';
import * as TYPE from '../../actions';
interface Status {
  username: string;
  state: 1 | 2 | 3;
}
export interface UserStatus {
  value: Status[];
  isSubmitting: boolean;
  error: { value?: string; time?: number };
}

export default (
  state: UserStatus = { value: [], isSubmitting: false, error: {} },
  action: AnyAction,
) => {
  switch (action.type) {
    case TYPE.ADMIN_USER_STATUS_CHANGE.OK:
      return {
        ...state,
        value: action.payload,
      };
    case TYPE.ADMIN_USER_SUBMIT.START:
      return {
        ...state,
        isSubmitting: true,
      };
    case TYPE.ADMIN_USER_SUBMIT.OK:
      return {
        ...state,
        isSubmitting: false,
      };
    case TYPE.ADMIN_USER_SUBMIT.FAIL:
      return {
        ...state,
        isSubmitting: false,
        error: { value: action.payload, time: Date.now() },
      };
    default:
      return state;
  }
};
