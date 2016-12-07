# DiSoNa
An experiment on HTTP/CoAP clients/server service to integrate with REST, and RabbitMQ

TODO:
(done)1. CoAP HTTP Service check add help
(done)2. coap/http register device
3. coap/http register org
    1. This will fall away. All entires are devices. Some are users some orgs and some devices although they basically looks the same
    2. Device is generally registered by itself and wil end up being polled. Can have orgs that owns it. This will be owners: []
    3. an org is a device that cannot be polled but can claim devices. You load device uuids for it if found it claims the device else it goes in a list for unclaimed if the device is not on the system yet. devices:[], unclaimed:[]. The idea of the org is just to allocate devices. unallocated evices can not be polled or used.
    4. A user is a device that can create and load orgs and can not be polled. Users are created by the admin. Users can not allocate devices or other orgs to themself. 
4. coap/http assign device to org
5. coap/http set device online (this is done by doing discover)
6. coap/http reset token of device
7. coap/http get all
8. coap/http get specific
9. coap/http subscribe all on one direct/silent and stop or schedule
10. coap/http subscribe specific on one direct/silent  and stop or schedule
11. multi subscribes direct/silent  and stop or schedule
