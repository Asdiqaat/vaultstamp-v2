let currentAlerts = Option.get(HashMap.get(alerts, { hash = Principal.hash; keyEq = Principal.equal }, msg.caller), []);
let updatedAlerts = Array.append(currentAlerts, [alertMsg]);
let _ = HashMap.put(alerts, { hash = Principal.hash; keyEq = Principal.equal }, msg.caller, updatedAlerts);