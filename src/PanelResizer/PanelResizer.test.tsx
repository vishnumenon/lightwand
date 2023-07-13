import { render } from '@testing-library/react';
import React from 'react';
import PanelResizer, { PanelResizerProps } from './PanelResizer';

describe('PanelResizer', () => {
    const defaultProps: PanelResizerProps = {};

    it('should render', () => {
        const props = { ...defaultProps };
        const { asFragment, queryByText } = render(<PanelResizer {...props} />);

        expect(asFragment()).toMatchSnapshot();
        expect(queryByText('PanelResizer')).toBeTruthy();
    });
});
