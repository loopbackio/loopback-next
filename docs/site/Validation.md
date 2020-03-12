---
lang: en
title: 'Validation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Validation.html
---

Within a LoopBack application, validation can take place in various places
depending on the usage. Some types of validation come out-of-the-box in
LoopBack, such as type validation in the REST layer, and some require additional
configuration or code.

For illustration purpose, a `CoffeeShop` model is being used. It has the
following properties.

| Property name |  Type  |                           Description |
| ------------- | :----: | ------------------------------------: |
| shopId        | string |                 ID of the coffee shop |
| city          | string | City where the coffee shop is located |
| phoneNum      | string |       Phone number of the coffee shop |
| capacity      | number |           Capacity of the coffee shop |

In summary, validation can be added in the following layers:

- [REST layer](Validation-REST-layer.md)
- [Controller layer](Validation-controller-layer.md)
- [ORM layer](Validation-ORM-layer.md)
