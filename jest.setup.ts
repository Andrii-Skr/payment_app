import { setDefaultResultOrder } from "node:dns";

// Force IPv4 resolution for localhost to avoid sandbox IPv6 listen errors in tests.
setDefaultResultOrder("ipv4first");
