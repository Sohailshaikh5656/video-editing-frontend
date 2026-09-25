(function (window) {
  window["env"] = window["env"] || {};
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "";
  window["env"]["CUT_SHORT_COMMON_IP_PORT"] = isLocal
    ? hostname + ":3300" //dynamic Url //falsy url
    : hostname + ":3300";
  window["env"]["CUT_SHORT_API_KEY"] = "mysecretApiKey";

  /* ── Cloudinary (public, client-safe values only) ──
     Uploads use the UNSIGNED preset flow, so only the cloud name and the
     preset name live here. Never put the API key/secret in frontend code.
     Create "cutroom_unsigned" in Cloudinary:
     Settings → Upload → Upload presets → Add (Signing mode: Unsigned). */
    window["env"]["CLOUDINARY_CLOUD_NAME"] = "tsx0d8ep";
    window["env"]["CLOUDINARY_UPLOAD_PRESET"] = "portfolio_uploads";
})(this);
