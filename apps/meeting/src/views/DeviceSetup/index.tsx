// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect } from 'react';
import { DeviceLabels, Heading, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import MeetingJoinDetails from '../../containers/MeetingJoinDetails';
import { StyledLayout } from './Styled';
import DeviceSelection from '../../components/DeviceSelection';
import { useAppState } from '../../providers/AppStateProvider';

const DeviceSetup: React.FC = () => {
  const meetingManager = useMeetingManager();
  const { persistDeviceController } = useAppState();

  // When set up to run before joining, enumerate and select devices here so the pickers and preview
  // populate on this page.
  useEffect(() => {
    if (persistDeviceController) {
      meetingManager.setupDevices(DeviceLabels.AudioAndVideo);
    }
  }, [meetingManager, persistDeviceController]);

  return (
    <StyledLayout>
      <Heading tag="h1" level={3} css="align-self: flex-start">
        Device settings
      </Heading>
      <DeviceSelection />
      <MeetingJoinDetails />
    </StyledLayout>
  );
};

export default DeviceSetup;
