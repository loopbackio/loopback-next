Here is the proposal for the followup tasks for
https://github.com/strongloop/loopback-next/issues/1978. Anything needs to be
clarified or you'd like to be added, do let me know.

**1. Spike: Dependency injection or its alternative in JSLB4**

_Acceptance criteria:_

a. Should be demonstrated in a class b. Should be used with
[JSLB4 Application class](https://github.com/strongloop/loopback4-example-javascript/blob/class-factory/server/application.js)
c. Should be able to read properties from the LB4 `context` d. Should be able to
bind new properties the LB4 `context` e. Should be able to unbind properties
from the LB4 `context`

**2. Spike: Create Route in JSLB4**

_Acceptance criteria:_

a. Should be created as a class b. Should be useable with
[JSLB4 Application class](https://github.com/strongloop/loopback4-example-javascript/blob/class-factory/server/application.js)
c. Should have access to: i. The LB4 request object and metadata contributed by
LB4 components eg: `@loopback/authentication` ii. A Model iii. The LB4 response
object

**3. Spike: Create Sequence in JSLB4**

_Acceptance criteria:_

a. Should be created as a class b. Demonstrate usage with
[JSLB4 Application class](https://github.com/strongloop/loopback4-example-javascript/blob/class-factory/server/application.js)

**4. Spike: Create Model in JSLB4**

_Acceptance criteria:_

a. Should be created as a class b. Should be automatically loaded in the LB4 app
c. Should be able to describe model properties d. Should show up on Explorer and
should be successfully interactive

**5. Spike: Create Repository in JSLB4**

_Acceptance criteria:_

a. Should be created as a class b. Should be automatically loaded in the LB4 app
c. Should have access to a specified Model d. Should expose CRUD methods to
interact with the Model e. Should allow custom methods to be added, with access
to: i. The LB4 request object ii. A Model

**6. Spike: Create Controller in JSLB4**

_Acceptance criteria:_

a. Should be created as a class b. Should be automatically loaded in the LB4 app
c. Should have access to a specified Repository d. Should expose CRUD methods to
interact with the Repository e. Should allow custom methods to be added, with
access to: i. The LB4 request object ii. A Model iii. A Repository iv. The LB4
response object

I think, once **Spike 1** is sorted out, everything else will come along
smoothly.
