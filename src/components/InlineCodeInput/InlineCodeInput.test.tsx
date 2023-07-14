import { render } from '@testing-library/react';
import React from 'react';
import InlineCodeInput, { InlineCodeInputProps } from './InlineCodeInput';

describe('InlineCodeInput', () => {
    const defaultProps: InlineCodeInputProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<InlineCodeInput {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('InlineCodeInput')).toBeTruthy();
    });
});
