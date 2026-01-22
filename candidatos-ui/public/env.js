(function(window) {
  window["env"] = window["env"] || {};

  /////////////////////////////////////////////////////////////////////////
  // https://pumpingco.de/blog/environment-variables-angular-docker/
  /////////////////////////////////////////////////////////////////////////
  // Environment variables

  /* Local */
  window["env"]["apiUrl"] = "http://localhost:3008/";
  // window["env"]["apiUsuarios"] = "http://localhost:3001/";
  window["env"]["apiUsuarios"] = "http://10.51.15.41:3001/";
  window["env"]["apiPadron"] = "http://10.51.15.41:3002/";
  window["env"]["reportsUrl"] = "http://10.51.15.110:8123/api/reports/";
  window["env"]["debug"] = true;

})(this);
