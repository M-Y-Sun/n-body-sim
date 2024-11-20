class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class Vec extends Point
{
    constructor(x, y) { super (x, y); }

    /** @returns The square of the norm of the vector. */
    normsq() { return this.x * this.x + this.y * this.y; }

    /** @returns The norm of the vector. */
    norm() { return Math.sqrt(this.normsq()); }

    /** Scales the vector by a constant. */
    scale(n)
    {
        this.x *= n;
        this.y *= n;
    }

    /**
     * Normalizes the vector to be of norm n.
     * @param {number} n The norm to normalize to.
     */
    normalize(n)
    {
        const norm = this.norm();

        if (norm == 0) {
            this.scale(0);
            return;
        }

        this.scale(n / norm);
    }

    /**
     * @param {Vec} v The vector to add to.
     * @returns The sum of two vectors.
     */
    sum(v) { return new Vec (this.x + v.x, this.y + v.y); }

    /**
     * @param {Vec} v The vector to dot with.
     * @returns The dot product of two vectors;
     */
    dot(v) { return this.x * v.x + this.y + v.y; }
}

class QTNode
{
    /**
     * @param {Point} center The center of the quadrant.
     * @param {number} radius The width/height of each sub-quadrant.
     */
    constructor(center, radius)
    {
        this.children = [ null, null, null, null ];

        this.center = center;
        this.radius = radius;

        this.id = null;

        this.totalMass = 0;
        this.com       = new Point (0, 0);

        this.forceVec = new Vec (0, 0);
    }

    /**
     * Adds a child to the current QTNode and sets the center and radius of the node.
     * @param {number} qd The quadrant to insert the child to.
     */
    addChild(qd)
    {
        let cx, cy;

        if (qd == 0 || qd == 3)
            cx = (this.center.x + this.radius) / 2;
        else
            cx = (this.center.x - this.radius) / 2;

        if (qd == 1 || qd == 2)
            cy = (this.center.y + this.radius) / 2;
        else
            cy = (this.center.y - this.radius) / 2;

        this.children[qd] = new QTNode (new Point (cx, cy), this.radius / 2);
    }

    /** @returns If the QTNode represents a leaf node. */
    isLeaf()
    {
        for (var chd of this.children)
            if (chd != null)
                return false;

        return true;
    }
}

class Quadtree
{
    /**
     * Constructs a Quadtree.
     * @param {number} x The x-coordinate of the center of the bounding box
     * @param {number} y The y-coordinate of the center of the bounding box
     * @param {number} size The size of the bounding box.
     */
    constructor(x, y, size)
    {
        this.root  = new QTNode (new Point (x, y), size / 2);
        this.nodes = [];

        console.log(`Constructed Quadtree with center (${x}, ${y}) and size ${size}.`);
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
    #forceFunc(m1, m2, r)
    {
        if (r == 0)
            return 0;

        return 6.6743015e1 * m1 * m2 / (r * r);
    }

    /**
     * Recursively adds a body to the quadtree
     * @param {number} x1 The x-coordinate of the body.
     * @param {number} y1 The y-coordinate of the body.
     * @param {number} mass The mass of the body.
     * @param {string} id The HTML ID of the body.
     * @param {QTNode} node The node to recurse on.
     * @returns The added body as a QTNode.
     */
    addBody(x1, y1, mass, id, node)
    {
        const qdOld = this.#getQuadrant(node.center, node.com);
        const qdNew = this.#getQuadrant(node.center, new Point (x1, y1));

        // if the current node is a leaf node representing a single body, slice the quadrant and move the node
        if (node != this.root && node.isLeaf() && node.id != null) {
            node.children[qdOld] = structuredClone (node);
            node.addChild(qdOld);
            node.id       = null;
            node.forceVec = null;
        }

        node.com.x = (node.com.x * node.totalMass + x1 * mass) / (node.totalMass + mass);
        node.com.y = (node.com.y * node.totalMass + y1 * mass) / (node.totalMass + mass);
        node.totalMass += mass;

        // if the current node is an empty leaf
        if (node != this.root && node.isLeaf() && node.id == null) {
            node.id = id;
            this.nodes.push(node);
            return node;
        }

        if (node.children[qdNew] == null)
            node.addChild(qdNew);

        return this.addBody(x1, y1, mass, id, node.children[qdNew]);
    }

    /**
     * Recursively calculates the net force vector acted on a specified body.
     * @param {number} x The x-coordinate of the body.
     * @param {number} y The y-coordinate of the body.
     * @param {number} theta The permitted error.
     * @param {QTNode} targ The node to calculate on.
     * @param {QTNode} node The node to recurse on.
     */
    calcForceV(targ, node, theta)
    {
        console.log("------calcForceV:------");
        console.log(targ);
        console.log(node);
        console.log("-----------------------");

        // debugger;

        if (node.id == targ.id)
            return;

        const s = Math.sqrt(Math.pow(targ.com.x - node.com.x, 2) + Math.pow(targ.com.y - node.com.y, 2));
        const d = 2 * node.radius;

        if (node.isLeaf() || s / d < theta) {
            let   v     = new Vec (node.com.x - targ.com.x, node.com.y - targ.com.y);
            const fmagn = this.#forceFunc(targ.totalMass, node.totalMass, v.norm());

            console.log(`Normalize vector <${v.x}, ${v.y}> to ${fmagn}.`)

            v.normalize(fmagn);

            targ.forceVec = targ.forceVec.sum(v);

            console.log(targ.forceVec);

            return;
        }

        for (var chd of node.children)
            if (chd != null)
                this.calcForceV(targ, chd, theta);
    }
}
