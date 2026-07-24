// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { PropsWithChildren, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AudioInputDevice, VoiceFocusTransformDevice } from 'amazon-chime-sdk-js';
import {
  BackgroundBlurProvider,
  BackgroundReplacementProvider,
  MeetingProvider,
  useLogger,
  useVoiceFocus,
} from 'amazon-chime-sdk-component-library-react';
import { useAppState } from '../../providers/AppStateProvider';
import ConsoleLoggingEventController from '../../utils/ConsoleLoggingEventController';

import routes from '../../constants/routes';
import { NavigationProvider } from '../../providers/NavigationProvider';
import NoMeetingRedirect from '../NoMeetingRedirect';
import { Meeting, Home, DeviceSetup } from '../../views';
import MeetingEventObserver from '../MeetingEventObserver';
import { VideoFiltersCpuUtilization } from '../../types';

const MeetingProviderWithDeviceReplacement: React.FC<PropsWithChildren> = ({ children }) => {
  const { addVoiceFocus } = useVoiceFocus();
  const { enableMaxContentShares, persistDeviceController, isVoiceFocusDesired } = useAppState();

  const onDeviceReplacement = (nextDevice: string, currentDevice: AudioInputDevice) => {
    if (currentDevice instanceof VoiceFocusTransformDevice) {
      return addVoiceFocus(nextDevice);
    }
    return Promise.resolve(nextDevice);
  };

  // Memoized so a stable instance is passed to MeetingProvider across renders.
  const eventController = useMemo(() => new ConsoleLoggingEventController(), []);

  const meetingConfigValue = {
    onDeviceReplacement: onDeviceReplacement as any,
    ...(enableMaxContentShares ? { maxContentShares: 2 } : {}),
    // Web Audio is fixed at controller creation (Voice Focus), so derive it from the user's choice.
    ...(persistDeviceController
      ? { persistDeviceController: true, enableWebAudio: isVoiceFocusDesired, eventController }
      : {}),
  };

  return <MeetingProvider {...meetingConfigValue}>{children}</MeetingProvider>;
};

const MeetingProviderWrapper: React.FC = () => {
  const { videoTransformCpuUtilization, imageBlob } = useAppState();
  const logger = useLogger();

  const isFilterEnabled = videoTransformCpuUtilization !== VideoFiltersCpuUtilization.Disabled;

  const getMeetingProviderWrapper = () => {
    return (
      <>
        <NavigationProvider>
          <Routes>
            <Route path={routes.HOME} element={<Home />} />
            <Route
              path={routes.DEVICE}
              element={
                <NoMeetingRedirect>
                  <DeviceSetup />
                </NoMeetingRedirect>
              }
            ></Route>
            <Route
              path={`${routes.MEETING}/:meetingId`}
              element={
                <NoMeetingRedirect>
                  <MeetingModeSelector />
                </NoMeetingRedirect>
              }
            ></Route>
          </Routes>
        </NavigationProvider>
        <MeetingEventObserver />
      </>
    );
  };

  const getWrapperWithVideoFilter = (children: React.ReactNode) => {
    let filterCPUUtilization = parseInt(videoTransformCpuUtilization, 10);
    if (!filterCPUUtilization) {
      filterCPUUtilization = 40;
    }
    console.log(`Using ${filterCPUUtilization} background blur and replacement`);
    return (
      <BackgroundBlurProvider options={{ filterCPUUtilization, logger }}>
        <BackgroundReplacementProvider options={{ imageBlob, filterCPUUtilization, logger }}>
          {children}
        </BackgroundReplacementProvider>
      </BackgroundBlurProvider>
    );
  };

  const getMeetingProviderWithFeatures = (): React.ReactNode => {
    const baseWrapper = getMeetingProviderWrapper();

    return (
      <MeetingProviderWithDeviceReplacement>
        {isFilterEnabled ? getWrapperWithVideoFilter(baseWrapper) : baseWrapper}
      </MeetingProviderWithDeviceReplacement>
    );
  };

  return <>{imageBlob === undefined ? <div>Loading Assets</div> : getMeetingProviderWithFeatures()}</>;
};

const MeetingModeSelector: React.FC = () => {
  const { meetingMode } = useAppState();

  return <Meeting mode={meetingMode} />;
};

export default MeetingProviderWrapper;
