class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    /** @returns Clones a Point instance. */
    clone() { return new Point (this.x, this.y); }
}

class Vec extends Point
{
    constructor(x, y) { super (x, y); }

    /** @returns Clones a Vec instance. */
    clone() { return new Vec (this.x, this.y); }

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

const maxVelocity = 40;

class QTNode
{
    /**
     * @param {Point} center The center of the quadrant.
     * @param {number} radius The width/height of each sub-quadrant.
     */
    constructor(center, radius)
    {
        this.children = [ undefined, undefined, undefined, undefined ];

        this.center = center;
        this.radius = radius;

        this.id = null;

        this.totalMass = 0;
        this.com       = new Point (0, 0);

        this.force = new Vec (0, 0);
    }

    /** @returns Clones a QTNode instance. */
    clone()
    {
        let newObj       = new QTNode (this.center, this.radius);
        newObj.children  = [...this.children ];
        newObj.id        = this.id;
        newObj.totalMass = this.totalMass;
        newObj.com       = this.com.clone();
        newObj.force     = this.force.clone();

        return newObj;
    }

    /**
     * @param {number} qd The quadrant.
     * @returns The new center.
     */
    getNewCenter(qd)
    {
        let center = new Point (0, 0);

        if (qd == 0 || qd == 3)
            center.x = this.center.x + this.radius / 2;
        else
            center.x = this.center.x - this.radius / 2;

        if (qd == 1 || qd == 2)
            center.y = this.center.y + this.radius / 2;
        else
            center.y = this.center.y - this.radius / 2;

        return center;
    }

    /**
     * Adds a child to the current QTNode and sets the center and radius of the node.
     * @param {number} qd The quadrant to insert the child to.
     */
    addChild(qd) { this.children[qd] = new QTNode (this.getNewCenter(qd), this.radius / 2); }

    /** @returns If the QTNode represents a leaf node. */
    isLeaf()
    {
        for (var chd of this.children)
            if (chd != undefined)
                return false;

        return true;
    }

    numericID() { return parseInt (this.id.slice(4)); }

    /** @returns The acceleration of the body or group of bodies. */
    accel()
    {
        if (this.totalMass == 0) {
            return new Vec (0, 0);
        } else {
            let newVec = this.force.clone();
            newVec.scale(1 / this.totalMass);
            return newVec;
        }
    }

    /**
     * @param {number} t The time to calculate on.
     * @returns The velocity vector of the body or group of bodies after a certain time.
     * */
    velocity(t)
    {
        let a = this.accel();
        a.scale(t);

        if (a.norm() > maxVelocity)
            a.normalize(maxVelocity + 1);

        return a;
    }
}

class Quadtree
{
    #G    = 6.6743015e1;
    #RLIM = 6;
    // #VERR = 10;

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

        return this.#G * m1 * m2 / (r * r);
    }

    /**
     * @param {QTNode} n1 The moving node.
     * @param {QTNode} n2 The node to compare to.
     * @returns If n1 will collide with n2.
     */
    #checkCollision(n1, n2)
    {
        const n1v = n1.velocity(1);

        if (n1v.norm() > maxVelocity)
            return true;

        const n1sz = n1.totalMass / 2;
        const n2sz = n2.totalMass / 2;

        if (n1.com.x <= n2.com.x + n2sz && n2.com.x <= n1.com.x + n1sz && n1.com.y <= n2.com.y + n2sz
            && n2.com.y <= n1.com.y + n1sz)
            return true;

        return false;

        // // point to line distance formula
        // const num = Math.abs(n1v.y * n2.com.x - n1v.x * n2.com.y + n1v.x * n1.com.y - n1v.y * n1.com.x);
        // const den = n1v.norm();
        // console.log(num / den);
        // return num / den < this.#VERR;
    }

    /**
     * Adds a node to the this.nodes array
     * @param {QTNode} node The node to add
     */
    updNode(node)
    {
        const id          = node.numericID();
        this.nodes.length = Math.max(this.nodes.length, id + 1);
        this.nodes[id]    = node;
    }

    /**
     * Recursively adds a body to the quadtree
     * @param {number} x1 The x-coordinate of the body.
     * @param {number} y1 The y-coordinate of the body.
     * @param {number} mass The mass of the body.
     * @param {string} id The HTML ID of the body.
     * @param {QTNode} node The node to recurse on.
     * @returns If the body was successfully added.
     */
    addBody(x1, y1, mass, id, node = this.root)
    {
        const qdOld = this.#getQuadrant(node.center, node.com);
        const qdNew = this.#getQuadrant(node.center, new Point (x1, y1));

        if (node != this.root && node.isLeaf() && node.id != null) {
            // if the radius is too small, implying that the bodies are super close together, merge them
            if (node.radius <= this.#RLIM) {
                node.totalMass += mass;

                const elemTarg = document.getElementById(id);
                const elemNode = document.getElementById(node.id);

                if (elemTarg != null) {
                    elemTarg.remove();
                    elemNode.style.width  = node.totalMass + "px";
                    elemNode.style.height = node.totalMass + "px";
                }

                return false;
            } else {
                // if the current node is a leaf node representing a single body, slice the quadrant and move the node
                node.children[qdOld]           = node.clone();
                node.children[qdOld].center    = node.getNewCenter(qdOld);
                node.children[qdOld].radius    = node.radius / 2;
                node.children[qdOld].totalMass = node.totalMass;
                node.children[qdOld].children  = [ undefined, undefined, undefined, undefined ];

                this.updNode(node.children[qdOld]);

                node.id    = null;
                node.force = undefined;
            }
        }

        node.com.x = (node.com.x * node.totalMass + x1 * mass) / (node.totalMass + mass);
        node.com.y = (node.com.y * node.totalMass + y1 * mass) / (node.totalMass + mass);
        node.totalMass += mass;

        // if the current node is an empty leaf
        if (node != this.root && node.isLeaf() && node.id == null) {
            node.id = id;
            this.updNode(node);
            return true;
        }

        if (node.children[qdNew] == undefined)
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
        if (node.id == targ.id)
            return;

        const s = 2 * node.radius;
        const d = Math.sqrt(Math.pow(targ.com.x - node.com.x, 2) + Math.pow(targ.com.y - node.com.y, 2));

        if (node.isLeaf() || s / d < theta) {
            let   v     = new Vec (node.com.x - targ.com.x, node.com.y - targ.com.y);
            const fmagn = this.#forceFunc(targ.totalMass, node.totalMass, v.norm());

            // console.log(`Normalize vector <${v.x}, ${v.y}> to ${fmagn}.`)

            v.normalize(fmagn);

            targ.force = targ.force.sum(v);

            // console.log("force:")
            // console.log(targ.force);
            // console.log("\nacceleration:")
            // console.log(targ.accel());
            // console.log("\nvelocity at t=1:")
            // console.log(targ.velocity(1));

            return;
        }

        for (var chd of node.children)
            if (chd != undefined)
                this.calcForceV(targ, chd, theta);
    }

    /**
     * Recursively checks for collisions and merges colliding bodies.
     * @param {QTNode} node The node to recurse on.
     * @returns If the quadtree was modified.
     */
    collide(node)
    {
        let paLeaf = true;

        for (var chd of node.children)
            if (chd != undefined && !chd.isLeaf())
                paLeaf = false;

        if (paLeaf) {
            let ret = false;

            for (var i = 0; i < 4; ++i) {
                let n1 = node.children[i];

                if (n1 == undefined)
                    continue;

                for (var j = i + 1; j < 4; ++j) {
                    let n2 = node.children[j];

                    if (n2 == undefined)
                        continue;

                    const n1Elem = document.getElementById(n1.id);
                    const n2Elem = document.getElementById(n2.id);

                    if (this.#checkCollision(n1, n2)) {
                        if (n1Elem != null)
                            n1Elem.remove();

                        n2.totalMass += n1.totalMass;
                        n2Elem.style.width  = n2.totalMass + "px";
                        n2Elem.style.height = n2.totalMass + "px";

                        node.children[i]           = undefined;
                        this.nodes[n1.numericID()] = undefined;

                        ret = true;
                        continue;
                    }

                    if (this.#checkCollision(n2, n1)) {
                        if (n2Elem != null)
                            n2Elem.remove();

                        n1.totalMass += n2.totalMass;
                        n1Elem.style.width  = n1.totalMass + "px";
                        n1Elem.style.height = n1.totalMass + "px";

                        node.children[j]           = undefined;
                        this.nodes[n2.numericID()] = undefined;

                        ret = true;
                        continue;
                    }
                }
            }

            return ret;
        }

        for (var chd of node.children)
            if (chd != undefined && !chd.isLeaf())
                return this.collide(chd);
    }

    /** Updates the position of each leaf node and rebuilds the quadtree. */
    rebuild(theta)
    {
        for (var node of this.nodes) {
            if (node != undefined) {
                node.force.x = 0;
                node.force.y = 0;
                this.calcForceV(node, this.root, theta);
            }
        }

        if (this.collide(this.root))
            return;

        this.root = new QTNode (this.root.center, this.root.radius);
        let nodes = [];

        for (var node of this.nodes)
            nodes.push(node);

        this.nodes = [];

        for (var node of nodes) {
            if (node != undefined) {
                node.com.x += node.velocity(1).x;
                node.com.y += node.velocity(1).y;
                this.addBody(node.com.x, node.com.y, node.totalMass, node.id, this.root);
            }
        }
    }
}
