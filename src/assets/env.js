(function (window) {
  window["env"] = window["env"] || {};
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
  window["env"]["CUT_SHORT_COMMON_IP_PORT"] = isLocal
    ? hostname + ":3300" //dynamic Url //falsy url
    : hostname + ":3300";
    window["env"]["CUT_SHORT_API_KEY"] = "mysecretApiKey"
})(this);
