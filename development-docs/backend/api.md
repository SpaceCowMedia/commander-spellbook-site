# API

The `backend/src/api` directory dictates the public API and is written as an [express application](https://expressjs.com/).

All requests to the API validate the user's authorization token and attach the user id and permissions to the request.

## Routing

```
/v1/site-settings/*
/v1/user/*
```

### Site Settings

For updating settings specific to the site, such as the featured combos.

### User

For updating info about the user who is using the site.

## Middleware

If a collection of routes all require the same validation (such as a user permission), write [middleware](https://expressjs.com/en/guide/using-middleware.html) for it.

## Succces Responses

When reporting that a request is successful, use a status of `200` when the operation is complete and no changes were made (such as from a standard `GET` request) and a `201` when the operation caused a change to happen (such as from a standard `POST` request).

Chain the status call with JSON indicating that the request was succesful and any other data that needs to be passed back in the request.

```ts
// the request was succesful when no changes were made
res.status(200).json({
  success: true,
  // whatever relevant data is being passed down
  foo: "bar",
});

// the request was succesful and a change was made in the DB
res.status(201).json({
  success: true,
  // whatever relevant data is being passed down
  foo: "bar",
});
```

## Error Handling

JavaScript `Error` objects cannot be serialized meaningfully (It'll lose the message when turned into a JSON string), so instead we use a custom error object.

Use the following status in the following circumstances:

- 400 - when required parameters are missing
- 422 - when required parameters are present, but in an incorrect form
- 403 - when the user does not have permission to do the operation
- 404 - when the requested resource is not present
- 500 - when it's a unknown error

```ts
import {
  NotFoundError,
  PermissionError,
  UnknownError,
  ValidationError,
} from "../api/error";

// user does not have permission for this action
res.status(403).json(new PermissionError("Custom error message"));

// the resource could not be found
res.status(403).json(new NotFoundError("Custom error message"));

// a required post body param is missing
res.status(400).json(new ValidationError("Custom error message"));

// the required param is present, but it is in the wrong format
res.status(422).json(new ValidationError("Custom error message"));

// something went wrong, but we're not sure what it was
res.status(500).json(new UnknownError("Custom error message"));
```
