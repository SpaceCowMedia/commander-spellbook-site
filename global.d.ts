declare module 'next/config' {
  type ConfigTypes = () => {
    serverRuntimeConfig: {
      PROJECT_ROOT: string;
    };
  };

  declare const getConfig: ConfigTypes;

  export default getConfig;
}
