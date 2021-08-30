# TripChat RESTful API Documentation

## General Information

Host Name: `https://www.tripchat.site`

---

## Get Login State

* Method: `get`
* Path: `/exe/accounts/loginstate`

### Response

* Success:

```javascript
{
    account_id: [Account Id],
    name: [Account Name],
    email: [Email],
    isLogin: [True || False]
}
```

* Failed:
    * Regenerating Session Wrong:
    ```javascript
    {
      err: 'Something went wrong during regenerate session: ' + [Error Message]}
    }
    ```

---

## Login

* Method: `post`
* Path: `/exe/accounts/login`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    email: [Email],
    password: [Password],
    provider: ['email' || 'FB' || 'Google' ]
}
```

### Response

* Success:

```javascript
{
  message: `[Account Name]，歡迎回來!`
}
```

* Failed:
    * Wrong Data Format:
    ```javascript
    {
      err: "Login Error: Wrong Data Format"
    }
    ```
    * Regenerating Session Wrong:
    ```javascript
    {
      err: 'Something went wrong during regenerate session: ' + [Error Message]}
    }
    ```

---

## Signup

* Method: `post`
* Path: `/exe/accounts/login`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    name: [Account Name],
    email: [Email],
    password: [Password],
    provider: ['email' || 'FB' || 'Google' ]
}
```

### Response

* Success:

```javascript
{
  message:`[Account Name]，歡迎回來!`
}
```

* Failed:
    * Wrong Data Format:
    ```javascript
    {
      err: 'Signup Error: Wrong Data Format'
    }
    ```
    * Regenerating Session Wrong:
    ```javascript
    {
      err: 'Something went wrong during regenerate session: ' + [Error Message]}
    }
    ```

---

## Logout

* Method: `get`
* Path: `/exe/accounts/logout`

### Response

* Success:

```javascript
{
    message: 'See ya!'
}
```

* Failed:

```javascript
{
  err: [Error Message]}
}
```

---

## Update Account Name

* Method: `put`
* Path: `/exe/accounts/name`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    new_name: [New Account Name]
}
```

### Response

* Success:

```javascript
{
  name: [Account Name]
}
```

* Failed:
    * Regenerating Session Wrong:
    ```javascript
    {
      err: 'Something went wrong during regenerate session: ' + [Error Message]}
    }
    ```

---

## Get Trip List

* Method: `get`
* Path: `/exe/trips/triplist`

### Response

* Success:

```javascript
{
    trip_list(Type: Array)
}
```

* Failed:

```javascript
{
  err: '系統忙碌中，請稍候再試。'}
}
```

---

## Add New Marker

* Method: `post`
* Path: `/exe/trips/marker`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    trip_id: [Trip Id],
    lat: [Latitude],
    lng: [Longitude],
    content: [Centent]
}
```

### Response

* Success:

```javascript
{
    marker_id: [Marker Id],
    location: {
        lat: [Latitude],
        lng: [Longitude]
    },
    content: [Content]
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```

---

## Update Marker Content

* Method: `put`
* Path: `/exe/trips/marker`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    marker_id: [Marker Id],
    content: [New Content]
}
```

### Response

* Success:

```javascript
{
    message: `Content of the marker id = [Marker Id] is updated.`
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```

---

## Delete Marker

* Method: `delete`
* Path: `/exe/trips/marker`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    marker_id: [Marker Id]
}
```

### Response

* Success:

```javascript
{
    message: `刪除成功。`
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```

---

## Update Trip Title

* Method: `put`
* Path: `/exe/trips/title`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    trip_id: [Trip Id],
    new_title: [New Trip Title],
    old_title: [Old Trip Title]
}
```

### Response

* Success:

```javascript
{
    title: [New Trip Title]
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```

---

## Update Trip Date

* Method: `put`
* Path: `/exe/trips/Date`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    trip_id: [Trip Id],
    new_date: [New Trip Date],
    old_date: [Old Trip Date]
}
```

### Response

* Success:

```javascript
{
    date: [New Trip Date]
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```

---

## Update Trip Location

* Method: `put`
* Path: `/exe/trips/location`
* Headers:

| Field | Value |
| :---: | :---: |
| Content-Type | application/json |

* Body:

```javascript
{
    trip_id: [Trip Id],
    new_location: [New Trip Location],
    old_location: [Old Trip Title]
}
```

### Response

* Success:

```javascript
{
    location: [New Trip Location]
}
```

* Failed:
```javascript
{
  err: [Error Message]
}
```
