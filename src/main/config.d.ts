export type AlwaysOnTopMode = 'never' | 'always' | 'inMiniMode';

export interface Configuration {
  version?: number;

  audioApi: number;
  audioInputDeviceId: string;
  headsetOutputDeviceId: string;
  speakerOutputDeviceId: string;

  cid: string;

  /**
   * Legacy password.
   */
  password?: string;

  /**
   * Base64-encoded encrypted password.
   */
  encryptedPassword?: string;
  callsign: string;

  hardwareType: number;
  radioGain: number;

  // Boolean is the prior type for this property, AlwaysOnTopMode is the updated type.
  alwaysOnTop: boolean | AlwaysOnTopMode;
  consentedToTelemetry: boolean | undefined;
}
