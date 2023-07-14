import { render } from '@testing-library/react';
import React from 'react';
import StateTextEditor, { StateTextEditorProps } from './StateTextEditor';

describe('StateTextEditor', () => {
    const defaultProps: StateTextEditorProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<StateTextEditor {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('StateTextEditor')).toBeTruthy();
    });
});
