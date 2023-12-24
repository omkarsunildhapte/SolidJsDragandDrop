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

    let firstTree: wjNav.TreeView;
    let secondTree: wjNav.TreeView;

    const handleDragOver = (s: any, e: any) => {
        const t1 = e.dragSource.treeView;
        const t2 = e.dropTarget.treeView;

        if (t1 == t2) {
            e.cancel = true;
        }
        if (t1 !== t2) {
            e.cancel = false;
        }
    };

    const handleDrop = (s: any, e: any) => {
        const t1 = e.dragSource.treeView;
        const t2 = e.dropTarget.treeView;

        if (t1 !== t2) {
            debugger
            if (t1.itemsSource[0].header === t2.itemsSource[0].header) {
                if (e.data && e.data.data) {
                    const draggedItem = e.data.data;
                    const newFirstTreeData = [...firstTreeData()];
                    const newSecondTreeData = [...secondTreeData()];

                    const targetItem = e.dropTarget.dataItem;
                    const targetItems = targetItem.items || [];

                    const sourceItems = t1 === firstTree ? newFirstTreeData : newSecondTreeData;
                    const sourceIndex = sourceItems.findIndex((item) => item.header === draggedItem.header);
                    if (sourceIndex !== -1) {
                        sourceItems.splice(sourceIndex, 1);
                    }

                    targetItems.push({ header: draggedItem.header });

                    setFirstTreeData(newFirstTreeData);
                    setSecondTreeData(newSecondTreeData);
                }
            }
        }
    };

    createEffect(() => {
        const firstTreeHost = document.getElementById('firstTree');
        const secondTreeHost = document.getElementById('secondTree');

        if (firstTreeHost && secondTreeHost) {
            firstTree = new wjNav.TreeView(firstTreeHost, {
                itemsSource: firstTreeData(),
                displayMemberPath: 'header',
                childItemsPath: 'items',
                allowDragging: true,
                dragOver: handleDragOver,
                drop: handleDrop,
                dragStart: (s: any, e: any) => {
                    if (e.data && e.data.data) {
                        const draggedItem = e.data.data;
                        e.dragImage = createDragImage(draggedItem.header);
                    }
                },
            });

            secondTree = new wjNav.TreeView(secondTreeHost, {
                itemsSource: secondTreeData(),
                displayMemberPath: 'header',
                childItemsPath: 'items',
                allowDragging: true,
                dragOver: handleDragOver,
                drop: handleDrop,
                dragStart: (s: any, e: any) => {
                    if (e.data && e.data.data) {
                        const draggedItem = e.data.data;
                        e.dragImage = createDragImage(draggedItem.header);
                    }
                },
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
                    if (item.items) {
                        item.isCollapsed = !item.isCollapsed;
                    }
                }
            };

            onCleanup(() => {
                firstTree.dispose();
                secondTree.dispose();
            });

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

    function createDragImage(text: string) {
        const dragImage = document.createElement('div');
        dragImage.textContent = text;
        dragImage.style.backgroundColor = 'lightblue';
        dragImage.style.padding = '5px';
        dragImage.style.border = '1px solid #000';
        dragImage.style.position = 'absolute';
        dragImage.style.zIndex = '1000';
        document.body.appendChild(dragImage);
        return dragImage;
    }

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
