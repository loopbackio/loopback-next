export const apiSpec =
{
  "paths": {
    "/helloworld": {
      "get": {
        "x-operation-name": "helloWorld",
        "parameters": [
          {
            "name": "name",
            "in": "query",
            "description": "Your name.",
            "required": false,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Returns a hello world with your (optional) name."
          }
        }
      }
    }
  }
}
