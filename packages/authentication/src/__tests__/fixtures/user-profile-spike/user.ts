import {Entity, model, property} from '@loopback/repository';
import {securityId, UserProfile} from '@loopback/security';
import * as _ from 'lodash';

@model()
export class MyUser extends Entity {
  // Represents a property defined in `UserProfile` with different type
  // `id` is a number while the value of securityId is a string
  @property({
    type: 'number',
    id: true,
    required: true,
  })
  id: number;

  // Represents a property defined in `UserProfile` with same type
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  // Represents a required property not in interface `UserProfile`
  @property({
    type: 'string',
  })
  city: string;

  // Represents an optional property not in interface `UserProfile`
  @property({
    type: 'boolean',
  })
  worksFromRemote?: boolean;

  @property({
    type: 'password',
    required: true,
  })
  password: string;

  @property({
    type: 'email',
    required: true,
  })
  email: string;

  @property({
    type: 'object',
  })
  otherProperties?: object;

  constructor(data?: Partial<MyUser>) {
    super(data);
  }
}

/**
 * Convert a MyUser instance to an object in type UserProfile
 * @param user
 */
export function MyUserProfileFactory(user: MyUser): UserProfile {
  const minimumSet = ['id', 'name', 'email', 'city', 'worksFromRemote'];
  const userProfile: UserProfile = Object.assign({}, _.pick(user, minimumSet), {
    [securityId]: user.id.toString(),
  });

  return userProfile;
}
