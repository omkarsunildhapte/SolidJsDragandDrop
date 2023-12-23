import * as wjNav from '@grapecity/wijmo.nav';
import { createEffect, createSignal, onCleanup } from 'solid-js';
import { getData, getEmptyData } from './data';

declare global {
    interface Window {
        toggleExpandCollapse: (header: string, tree: wjNav.TreeView) => void;
    }
}

const TreeComponent = () => {
    const [firstTreeData, setFirstTreeData] = createSignal(getData());
    const [secondTreeData, setSecondTreeData] = createSignal(getEmptyData());

    const handleDragOver = (s: any, e: any) => {
        const t1 = e.dragSource.treeView;
        const t2 = e.dropTarget.treeView;

        if (t1 == t2) {
            e.cancel = true;
        }
        if (t1 != t2) {
            e.cancel = false;
        }
    };

    createEffect(() => {
        const firstTreeHost = document.getElementById('firstTree');
        const secondTreeHost = document.getElementById('secondTree');

        if (firstTreeHost && secondTreeHost) {
            const firstTree = new wjNav.TreeView(firstTreeHost, {
                itemsSource: firstTreeData(),
                displayMemberPath: 'header',
                childItemsPath: 'items',
                allowDragging: true,
            });

            const secondTree = new wjNav.TreeView(secondTreeHost, {
                itemsSource: secondTreeData(),
                displayMemberPath: 'header',
                childItemsPath: 'items',
                allowDragging: true,
                dragOver: handleDragOver,
            });

            window.toggleExpandCollapse = (header: string, tree: wjNav.TreeView) => {
                const findItem = (items: any[], header: string): any => {
                    for (const item of items) {
                        if (item.header === header) {
                            return item;
                        } else if (item.items) {
                            const found = findItem(item.items, header);
                            if (found) {
                                return found;
                            }
                        }
                    }
                    return null;
                };

                const item = findItem(tree.itemsSource, header);

                if (item) {
                    // Toggle the expanded/collapsed state only if the item is not a leaf node
                    if (item.items) {
                        item.isCollapsed = !item.isCollapsed;
                    }
                }
            };


            onCleanup(() => {
                firstTree.dispose();
                secondTree.dispose();
            });

            // Add event listeners to the root elements of the trees for expand/collapse
            firstTree.hostElement.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'SPAN') {
                    const header = target.textContent || '';
                    window.toggleExpandCollapse(header, firstTree);
                }
            });

            secondTree.hostElement.addEventListener('click', (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'SPAN') {
                    const header = target.textContent || '';
                    window.toggleExpandCollapse(header, secondTree);
                }
            });
        }
    });

    return (
        <div>
            <h2>Tree Component</h2>

            <div>
                <h3>First Tree</h3>
                <div id="firstTree"></div>
            </div>

            <div>
                <h3>Second Tree</h3>
                <div id="secondTree"></div>
            </div>
        </div>
    );
};

export default TreeComponent;
