export type SensorCauses =
  | "KEEP_ALIVE"
  | "OPTICAL_POWER_ALERT"
  | "BATTERY_ALERT"
  | "TEMPERATURE_ALERT";

export type OtdrCauses =
  | "Clear"
  | "Fiber cut"
  | "Injection"
  | "Attenuation"
  | "Short event level"
  | "Connector"
  | "Splice break or connector disconnected"
  | "Connector disconnected or strong bend"
  | "Fiber break"
  | "Fiber bending on splice or connector"
  | "Connector bending, dirty, loose"
  | "Fiber bending";
