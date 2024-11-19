class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class QTNode
{
    /**
     * @param {Point} center The center of the quadrant.
     * @param {number} rx The width of each sub-quadrant.
     * @param {number} ry The height of each sub-quadrant.
     */
    constructor(center, rx, ry)
    {
        this.children = [ null, null, null, null ];

        this.coord  = null; // null if it contains children
        this.center = center;
        this.rx     = rx;
        this.ry     = ry;

        this.id = null;

        this.totalMass = 0;
        this.com       = new Point (0, 0);

        this.forceVec = new Vec (0, 0);
    }

    addChild(qd)
    {
        let cx, cy;

        if (qd == 0 || qd == 3)
            cx = (this.center.x + this.rx) / 2;
        else
            cx = (this.center.x - this.rx) / 2;

        if (qd == 1 || qd == 2)
            cy = (this.center.y + this.ry) / 2;
        else
            cy = (this.center.y - this.ry) / 2;

        this.children[qd] = new QTNode (new Point (cx, cy), this.rx / 2, this.ry / 2);
    }
}

class Quadtree
{
    /**
     * Constructs a Quadtree.
     * @param {number} x1 The x-coordinate of the first corner of the bounding box
     * @param {number} y1 The y-coordinate of the first corner of the bounding box
     * @param {number} x2 The x-coordinate of the second corner of the bounding box
     * @param {number} y2 The y-coordinate of the second corner of the bounding box
     */
    constructor(x1, y1, x2, y2)
    {
        this.corner1 = new Point (x1, y1);
        this.corner2 = new Point (x2, y2);

        const center = new Point ((x1 + x2) / 2, (y1 + y2) / 2);
        const rx     = (x1 - x2) / 2;
        const ry     = (y1 - y2) / 2;

        this.root = new QTNode (center, rx, ry);
    }

    /**
     * @param {Point} center The center of the quadrant.
     * @param {Point} body The coordinates of the body.
     * @returns The quadrant number that the specified coordinate is in.
     */
    #getQuadrant(center, body)
    {
        if (body.y <= center.y)
            return body.x <= center.x ? 1 : 0;
        else
            return body.x <= center.x ? 2 : 3;
    }

    /**
     * @param {number} m1 The mass of the first body.
     * @param {number} m2 The mass of the first body.
     * @param {number} r The distance between the two masses.
     * @returns The force between to masses a distance r away.
     */
    #forceFunc(m1, m2, r) { return 6.6743015e-11 * m1 * m2 / (r * r); }

    /**
     * Recursively adds a body to the quadtree
     * @param {number} x1 The x-coordinate of the body.
     * @param {number} y1 The y-coordinate of the body.
     * @param {number} mass The mass of the body.
     * @param {string} id The HTML ID of the body.
     * @param {QTNode} node The node to recurse on.
     */
    addBody(x1, y1, mass, id, node)
    {
        node.com.x = (node.com.x * node.totalMass + x1 * mass) / (node.totalMass + mass);
        node.com.y = (node.com.y * node.totalMass + y1 * mass) / (node.totalMass + mass);

        const coord = new Point (x1, y1);

        if (node != this.root && node.id == null) {
            node.id = id;
            node.totalMass += mass;
            node.coord = coord;
            return;
        }

        // erase the coordinate if the node has children
        node.coord = null;

        const qd = this.#getQuadrant(node.center, coord);

        console.log(
            `getQuadrant: center: (${node.center.x}, ${node.center.y}), body: (${x1}, ${y1}) and returned ${qd}.`);

        if (node.children[qd] == null)
            node.addChild(qd);

        this.addBody(x1, y1, mass, id, node.children[qd]);
    }
}
