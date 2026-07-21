// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useMeetingManager,
  useNotificationDispatch,
  Severity,
  ActionType,
} from 'amazon-chime-sdk-component-library-react';

import routes from '../constants/routes';
import { useAppState } from '../providers/AppStateProvider';

const NoMeetingRedirect: React.FC<PropsWithChildren> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useNotificationDispatch();
  const meetingManager = useMeetingManager();
  const { persistDeviceController } = useAppState();

  const payload: { severity: Severity; message: string, autoClose: boolean } = {
    severity: Severity.INFO,
    message: 'No meeting found, please enter a valid meeting Id',
    autoClose: true,
  };

  useEffect(() => {
    // When setting up devices before joining, a missing session is expected here, so do not redirect.
    if (!meetingManager.meetingSession && !persistDeviceController) {
      dispatch({
        type: ActionType.ADD,
        payload: payload,
      });
      navigate(routes.HOME);
    }
  }, []);

  return <>{children}</>;
};

export default NoMeetingRedirect;
