import { take, all, select, put } from 'redux-saga/effects';

import request from '../../lib/API';
import messageMap from './messages-map';
import { RootState } from '../reducers';

import {
  SelectEffect,
  AllEffect,
  GenericAllEffect,
  TakeEffect,
  PutEffect,
} from 'redux-saga/effects';
export { SelectEffect, AllEffect, GenericAllEffect, TakeEffect, PutEffect };

import { loginValidateAll, registerValidateAll } from './validate';
import { replace, RouterAction } from 'react-router-redux';

export { RouterAction };

const loginRequest = async (usernameOrPhone: string, password: string, antiRobotToken: string) => {
  const res = await request({
    endpoint: '/v1/user/login',
    method: 'POST',
    body: {
      usernameOrPhone,
      password,
      antiRobotToken,
    },
  });
  if (res.httpStatusCode === 200) {
    return { successful: true, message: res.message };
  } else {
    return { successful: false, message: res.message };
  }
};

const registerRequest = async (
  username: string,
  password: string,
  phone: string,
  code: string,
  antiRobotToken: string,
) => {
  const res = await request({
    endpoint: '/v1/user/reg',
    method: 'POST',
    body: {
      username,
      password,
      phone,
      code,
      antiRobotToken,
    },
  });
  if (res.httpStatusCode === 200) {
    return { successful: true, message: res.message };
  }
  return { successful: false, message: res.message };
};

function* loginSaga() {
  while (true) {
    const { payload: antiRobotToken } = yield take('USER_ENTRY_LOGIN_SUBMIT');

    yield put({ type: 'LOGIN_BUTTON_LOADING', payload: true });

    yield loginValidateAll();

    const { login: { username, password, autoLogin } } = yield select(
      (store: RootState) => store.userEntry,
    );

    if (username.value && password.value) {
      if (username.validateStatus !== 'error' && password.validateStatus !== 'error') {
        const { successful, message } = yield loginRequest(
          username.value,
          password.value,
          antiRobotToken,
        );
        if (successful) {
          if (autoLogin.value === false) {
            // request 会自动存储 token，
            const token = localStorage.getItem('token');
            localStorage.removeItem('token');
            sessionStorage.setItem('token', token!);
          }
          yield put(replace('/console'));
        } else {
          yield loginErrorTip(message);
        }
      }
    }

    yield put({ type: 'LOGIN_BUTTON_LOADING', payload: false });
  }
}

function* registerSaga() {
  while (true) {
    const { payload: antiRobotToken } = yield take('USER_ENTRY_REGISTER_SUBMIT');

    yield put({ type: 'REGISTER_BUTTON_LOADING', payload: true });

    yield registerValidateAll();

    const { register: { username, password, phone, code } } = yield select(
      (store: RootState) => store.userEntry,
    );

    if (username.value && password.value && phone.value && code.value) {
      if (username.validateStatus !== 'error' && password.validateStatus !== 'error') {
        const { successful, message } = yield registerRequest(
          username.value,
          password.value,
          phone.value,
          code.value,
          antiRobotToken,
        );
        if (successful) {
          yield put(replace('/console'));
        } else {
          yield registerErrorTip(message);
        }
      }
    }

    yield put({ type: 'REGISTER_BUTTON_LOADING', payload: false });
  }
}

export default function* loginRegisterSaga() {
  yield all([loginSaga(), registerSaga()]);
}

export async function checkLoginStatus() {
  const result = await request({
    endpoint: '/v1/user/login_status',
    method: 'GET',
  });
}

function* loginErrorTip(message: API.Message) {
  const tip = {} as any;
  tip.validateStatus = 'error';
  tip.help = messageMap(message);
  if (message === 'UserNotFound') {
    tip.fieldName = 'username';
  }
  if (message === 'PasswordWrong') {
    tip.fieldName = 'password';
  }

  yield put({ type: 'LOGIN_FORM_TIP_CHANGE', payload: tip });
}

function* registerErrorTip(message: API.Message) {
  const tip = {} as any;
  tip.validateStatus = 'error';
  tip.help = messageMap(message);
  if (message === 'PhoneInvalid') {
    tip.fieldName = 'phone';
  }
  if (message === 'PhoneExists') {
    tip.fieldName = 'phone';
  }
  if (message === 'PasswordInvalid') {
    tip.fieldName = 'password';
  }
  if (message === 'UsernameExists') {
    tip.fieldName = 'username';
  }
  if (message === 'UsernameInvalid') {
    tip.fieldName = 'username';
  }

  yield put({ type: 'REGISTER_FORM_TIP_CHANGE', payload: tip });
}
