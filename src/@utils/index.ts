export const normalizePort = (val: string) => {
  const tempPort = parseInt(val, 10);
  if (isNaN(tempPort)) {
    // named pipe
    return val;
  }

  if (tempPort >= 0) {
    // port number
    return tempPort;
  }
  return false;
};
