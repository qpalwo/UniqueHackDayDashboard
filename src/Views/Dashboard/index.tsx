import * as React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { connect } from 'react-redux';
import { RootState } from '../../redux/reducers';

import DashboardLayout from '../../Layouts/DashboardLayout';
import ConsoleView from '../Console';
import TeamConsole from '../TeamConsole';
import ApplyView from '../ApplyView';
import { replace } from 'react-router-redux';

export interface DashboardProps {
  loggedIn: boolean;
  isD: boolean;
  selfReplace: (loc: string) => void;
  menuItemDisabled: boolean;
}

const RedirectToDetail = () => <Redirect to="/apply/detail" />;

const Dashboard = (props: DashboardProps) => {
  const { isD } = props;
  if (!props.loggedIn) {
    return <Redirect to="/user_entry" />;
  }
  return (
    <DashboardLayout
      replace={props.selfReplace}
      menuItemDisabled={props.menuItemDisabled}
      menuItemDisabledMsg={'必须完成报名表单才能进行该操作!'}
    >
      <Switch>
        <Route path="/apply" component={ApplyView} />
        <Route path="/team" component={isD ? TeamConsole : RedirectToDetail} />
        <Route path="/" component={isD ? ConsoleView : RedirectToDetail} />
      </Switch>
    </DashboardLayout>
  );
};

export default connect(
  (state: RootState) => {
    const pathname = (state.route && state.route.location && state.route.location.pathname) || '';
    return {
      loggedIn: state.auth.loggedIn,
      menuItemDisabled: pathname.indexOf('/apply') === 0 && pathname !== '/apply/done',
      isD: state.user.isDetailFormSubmitted,
    };
  },
  dispatch => ({
    selfReplace(location: string) {
      dispatch(replace(location));
    },
  }),
)(Dashboard);
