function deviceIsMobile(): boolean {
  return window.innerWidth <= 1024;
}

const DeviceService = {
  deviceIsMobile,
};

export default DeviceService;
