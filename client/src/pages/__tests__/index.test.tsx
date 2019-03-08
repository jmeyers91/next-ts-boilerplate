import React from 'react';
import IndexPage from '../index';
import { shallow } from 'enzyme';

describe('pages/index', () => {
  test('Should render without error', () => {
    const wrapper = shallow(<IndexPage />);
  });
});
