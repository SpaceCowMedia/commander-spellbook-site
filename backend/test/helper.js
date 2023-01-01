function createRequest(options) {
  const { body, headers, params, userId, userPermissions } = options || {};

  // not perfect, but the request object has a billion properties, most of which we don't care about
  return {
    headers: headers || {
      authorization: "Bearer auth",
    },
    body: body || {},
    params: params || {},
    userPermissions: userPermissions || {
      provisioned: true,
      proposeCombo: true,
    },
    userId: userId || "user-id",
  };
}

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
  }; // same thing here with the request object
}

function createNext() {
  return jest.fn();
}

function createAdminAuth(options) {
  const { claimsSpy, getUserSpy, updateUserSpy, verifyIdTokenSpy } = options;

  return jest.fn().mockReturnValue({
    getUser: getUserSpy || jest.fn(),
    setCustomUserClaims: claimsSpy || jest.fn(),
    updateUser: updateUserSpy || jest.fn(),
    verifyIdToken: verifyIdTokenSpy || jest.fn(),
  });
}

module.exports = {
  createRequest,
  createResponse,
  createNext,
  createAdminAuth,
};
