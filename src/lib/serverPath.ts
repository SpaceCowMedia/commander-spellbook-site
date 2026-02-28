import path from 'path';

const serverPath = (staticFilePath: string) => {
  return path.join(process.cwd(), staticFilePath);
};

export default serverPath;
